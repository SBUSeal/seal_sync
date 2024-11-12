package main

import (
	"bufio"
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

var file_transfer_protocol = protocol.ID("/sealsync/file-transfer")
var provider_info_protocol = protocol.ID("/sealsync/providerinfo")

// Functions for transfering files and provider information

func handleFileRequests(node host.Host) {
	node.SetStreamHandler(file_transfer_protocol, func(s network.Stream) {
		defer s.Close()
		buf := bufio.NewReader(s)
		// Read cid from the stream
		cid, err := buf.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				log.Printf("Stream closed by peer: %s", s.Conn().RemotePeer())
			} else {
				log.Printf("Error reading from stream: %v", err)
			}
			return
		}
		log.Printf("File Transfer Cid Received: %s, now sending file...", cid)
		//Send file name first
		cid = strings.TrimSuffix(cid, "\n")
		fileInfo, exists := cidMap[cid]
		if !exists {
			fmt.Println("File didnt exist in map error")
			return
		}
		s.Write([]byte(filepath.Base(fileInfo.FilePath + "\n")))

		//Open the file
		file, err := os.Open(fileInfo.FilePath)
		if err != nil {
			fmt.Println("Failure to open the file")
		}

		bytes, err := io.Copy(s, file)
		if err != nil {
			fmt.Println("Failure to copy the file to the stream")
		}

		fmt.Fprintf(os.Stdout, "Successfully sent file, %d bytes were sent", bytes)

	})
}

// Connect to peer through relay, (get price), send cid then wait for response containing the file
func requestFile(node host.Host, targetpeerid string, cid string) {
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
	reader := bufio.NewReader(s)

	//Read filename
	filename, err := reader.ReadString('\n')
	if err != nil {
		fmt.Println("Error reading the file name")
	}
	filename = strings.TrimSuffix(filename, "\n")
	fmt.Println("Received Filename: ", filename)

	// Create the downloads directory if it doesn't exist
	err = os.MkdirAll("downloads", os.ModePerm)
	if err != nil {
		fmt.Errorf("failed to create directory: %v", err)
	}
	//Create new file
	newFile, err := os.Create(filepath.Join("downloads", filename))
	if err != nil {
		fmt.Println("Error creating the file: ", err)
	}
	//Copy file contents to the new file
	bytes, err := io.Copy(newFile, s)
	if err != nil {
		fmt.Println("Error copying from stream to new file: ", err)
	}
	fmt.Fprintf(os.Stdout, "Successfully copied %d bytes from the stream", bytes)

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
