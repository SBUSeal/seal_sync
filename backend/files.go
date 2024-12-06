package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime"
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

type FileMetadata struct {
	Name          string  `json:"name"`
	Size          int64   `json:"size"`
	Type          string  `json:"type"`
	Price         float64 `json:"price"`
	WalletAddress string  `json:"walletAddress"`
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

// Reads the cid as a string from the given stream
func readCid(s network.Stream) string {
	buf := bufio.NewReader(s)
	cid, err := buf.ReadString('\n')
	if err != nil {
		log.Fatal(err)
	}
	cid = strings.TrimSuffix(cid, "\n")
	return cid
}

func getFileMetadata(file *os.File, price float64) FileMetadata {

	info, err := file.Stat()
	if err != nil {
		log.Fatal("Error getting file info:", err)
	}
	fileName := info.Name()
	fileSize := info.Size()
	fileExt := filepath.Ext(fileName)
	fileType := mime.TypeByExtension(fileExt)
	// If we can't get the type, do it manually
	if fileType == "" {
		if fileType == "" {
			switch fileExt {
			case ".txt":
				fileType = "text/plain"
			case ".html":
				fileType = "text/html"
			case ".png":
				fileType = "image/png"
			case ".pdf":
				fileType = "application/pdf"
			default:
				fileType = "application/octet-stream" // Fallback
			}
		}
	}

	FileMetadata := FileMetadata{
		Name:          fileName,
		Size:          fileSize,
		Type:          fileType,
		Price:         price,
		WalletAddress: WALLET_ADDRESS,
	}

	return FileMetadata
}

func handleFileRequests(node host.Host) {
	node.SetStreamHandler(file_transfer_protocol, func(s network.Stream) {
		defer s.Close()
		// Read cid from the stream
		cid := readCid(s)
		// Find the file in our uploaded file map
		fileInfo, exists := uploadedFileMap[cid]
		if !exists {
			fmt.Println("File didnt exist in map error")
			return
		}
		filePath := filepath.Join("uploads", fileInfo.Name)
		// Open the file
		file, err := os.Open(filePath)
		if err != nil {
			log.Fatal("Error opening file")
		}
		// Get file metadata
		FileMetadata := getFileMetadata(file, fileInfo.Price)

		// Send file metadata
		var data []byte
		data, err = json.Marshal(FileMetadata)
		if err != nil {
			log.Fatal("Error marshalling file metadata", err)
		}
		s.Write(data)

		//Send the file contents
		_, err = io.Copy(s, file)
		if err != nil {
			log.Fatal(err)
		}
	})
}

// Connect to peer through relay, (get price), send cid then wait for response containing the file
func requestFile(node host.Host, targetpeerid string, cid string) (FileMetadata, network.Stream) {
	peerinfo := connectToPeerUsingRelay(node, targetpeerid)
	s, err := node.NewStream(network.WithAllowLimitedConn(globalCtx, "file transfer"), peerinfo.ID, file_transfer_protocol)
	if err != nil {
		log.Fatalf("Failed to open stream to %s: %s", peer.ID(targetpeerid), err)
	}
	//Write the cid
	_, err = s.Write([]byte(cid + "\n"))
	if err != nil {
		log.Fatalf("Failed to write to stream: %s", err)
	}

	// Get the file's metadata
	decoder := json.NewDecoder(s)
	var fileMetadata FileMetadata
	err = decoder.Decode(&fileMetadata)
	if err != nil {
		log.Fatal(err)
	}

	// Return the metadata, and a stream that will be used for downloading
	return fileMetadata, s
}

func handleProviderInfoRequests(node host.Host) {
	node.SetStreamHandler(provider_info_protocol, func(s network.Stream) {
		defer s.Close()
		//read the cid
		cid := readCid(s)

		// Dont send our info if we have unpublished this file
		peer_id := node.ID().String()
		if hasBeenUnpublished(cid) {
			peer_id = "UNAVAILABLE"
		}

		// Create FileProviderInfo to be sent back
		price := strconv.FormatFloat(uploadedFileMap[cid].Price, 'f', -1, 64)
		geoLocation := getGeolocation()
		providerInfo := FileProviderInfo{
			Peer_id:  peer_id,
			Price:    price,
			Location: geoLocation,
		}

		// Marshal the provider info
		jsonData, err := json.Marshal(providerInfo)
		if err != nil {
			log.Fatal(err)
		}
		// Write the provider info to the stream
		_, err = s.Write(jsonData)
		if err != nil {
			log.Fatal(err)
		}
	})
}

// Connects to peer through relay, sends cid then waits for response containing the provider info
func requestProviderInfo(node host.Host, targetpeerid string, cid cid.Cid) FileProviderInfo {

	peerinfo := connectToPeerUsingRelay(node, targetpeerid)
	s, err := node.NewStream(network.WithAllowLimitedConn(globalCtx, "Provider info"), peerinfo.ID, provider_info_protocol)
	if err != nil {
		log.Fatalf("Failed to open stream to %s: %s", peerinfo.ID, err)
	}
	defer s.Close()
	_, err = s.Write([]byte(cid.String() + "\n"))
	if err != nil {
		log.Fatalf("Failed to write to stream: %s", err)
	}
	// Read the provider info
	decoder := json.NewDecoder(s)
	var info FileProviderInfo
	err = decoder.Decode(&info)
	if err != nil {
		log.Fatal(err)
	}
	return info
}
