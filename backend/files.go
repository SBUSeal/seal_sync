package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/protocol"
)

type TransferFile struct {
	Name    string `json:"name"`
	Size    int64  `json:"size"`
	Content []byte `json:"content"`
}

type LocationInfo struct {
	IP      string `json:"ip"`
	Country string `json:"country"`
	Region  string `json:"region"`
}

type FileProviderInfo struct {
	Peer_id  string       `json:"peer_id"`
	Price    string       `json:"price"`
	Location LocationInfo `json:"location"`
}

var file_transfer_protocol = protocol.ID("/sealsync/file-transfer")
var provider_info_protocol = protocol.ID("/sealsync/providerinfo")

// Functions for transfering files and provider information

func handleFileRequests(node host.Host) {
	node.SetStreamHandler(file_transfer_protocol, func(s network.Stream) {
		defer s.Close()
		buf := bufio.NewReader(s)
		// Read cid from the stream
		cid, err := buf.ReadString('\n')
		cid = strings.TrimSuffix(cid, "\n")
		// Find the file in our cid map
		fileInfo, exists := cidMap[cid]
		if !exists {
			fmt.Println("File didnt exist in map error")
			return
		}
		// Read the file into a buffer and send it over the stream
		file, err := os.Open(fileInfo.FilePath)
		if err != nil {
			log.Fatal("Error opening file")
		}

		var fileBuffer bytes.Buffer
		filename := filepath.Base(fileInfo.FilePath)
		filesize, err := io.Copy(&fileBuffer, file)
		if err != nil {
			log.Fatal("Error copying file to buffer")
		}

		transferFile := TransferFile{
			Name:    filename,
			Size:    filesize,
			Content: fileBuffer.Bytes(),
		}

		var data []byte
		data, err = json.Marshal(transferFile)
		if err != nil {
			log.Fatal("Error marshalling transfer file")
		}

		s.Write(data)
	})
}

// Connect to peer through relay, (get price), send cid then wait for response containing the file
func requestFile(node host.Host, targetpeerid string, cid string) TransferFile {
	peerinfo := connectToPeerUsingRelay(node, targetpeerid)
	s, err := node.NewStream(network.WithAllowLimitedConn(globalCtx, "file transfer"), peerinfo.ID, file_transfer_protocol)
	if err != nil {
		log.Printf("Failed to open stream to %s: %s", peer.ID(targetpeerid), err)
	}
	defer s.Close()
	//Write the cid
	_, err = s.Write([]byte(cid + "\n"))
	if err != nil {
		log.Fatalf("Failed to write to stream: %s", err)
	}

	// Get the transferred file
	decoder := json.NewDecoder(s)
	var TransferredFile TransferFile
	err = decoder.Decode(&TransferredFile)
	if err != nil {
		if err == io.EOF {
			log.Fatal("End of stream reached")
		} else {
			log.Fatal("Error decoding JSON:", err)
		}
	}
	fmt.Println("(files.go) Downloaded File Name & Size: ", TransferredFile.Name, TransferredFile.Size)
	return TransferredFile
}

func handleProviderInfoRequests(node host.Host) {
	node.SetStreamHandler(provider_info_protocol, func(s network.Stream) {
		defer s.Close()
		buf := bufio.NewReader(s)
		//read the cid
		cid, err := buf.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				log.Printf("Stream closed by peer: %s", s.Conn().RemotePeer())
			} else {
				log.Printf("Error reading from stream: %v", err)
			}
			return
		}
		cid = strings.TrimSuffix(cid, "\n")
		// Create FileProviderInfo to be sent back
		price := strconv.FormatFloat(cidMap[cid].Price, 'f', -1, 64)
		geoLocation := getGeolocation()
		providerInfo := FileProviderInfo{
			Peer_id:  node.ID().String(),
			Price:    price,
			Location: geoLocation,
		}

		// Marshal the provider info
		jsonData, err := json.Marshal(providerInfo)
		if err != nil {
			log.Fatal(err)
		}
		// Write the provider info and a newline to the stream
		_, err = s.Write(append(jsonData, '\n'))
		if err != nil {
			log.Fatal(err)
		}
	})
}

// Connects to peer through relay, sends cid then waits for response containing the price
func requestProviderInfo(node host.Host, targetpeerid string, cid cid.Cid) FileProviderInfo {

	peerinfo := connectToPeerUsingRelay(node, targetpeerid)
	s, err := node.NewStream(network.WithAllowLimitedConn(globalCtx, "Provider info"), peerinfo.ID, provider_info_protocol)
	if err != nil {
		log.Printf("Failed to open stream to %s: %s", peerinfo.ID, err)
	}
	defer s.Close()
	_, err = s.Write([]byte(cid.String() + "\n"))
	if err != nil {
		log.Fatalf("Failed to write to stream: %s", err)
	}
	// Read the price from the peer
	var info FileProviderInfo
	reader := bufio.NewReader(s)
	providerInfoData, err := reader.ReadString('\n')
	if err != nil {
		log.Fatalf("Failed to read provider info: %s", err)
	}
	err = json.Unmarshal([]byte(providerInfoData), &info)
	if err != nil {
		log.Fatalf("Failed to unmarshal file provider info: %s", err)
	}
	return info
}
