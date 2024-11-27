package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/ipfs/go-cid"
	dht "github.com/libp2p/go-libp2p-kad-dht"
)

// Type for storing information about uploaded files
type UploadedFileInfo struct {
	Name          string    `json:"name"`
	Price         float64   `json:"price"`
	Description   string    `json:"description"`
	Size          int64     `json:"size"`
	Cid           string    `json:"cid"`
	Published     bool      `json:"published"`
	UnpublishTime time.Time `json:"unpublishTime"`
	DateAdded     string    `json:"dateAdded"`
	Source        string    `json:"source"`
}

// Type for storing information about downloaded files
type DownloadedFileInfo struct {
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
	Size        int64   `json:"size"`
	Cid         string  `json:"cid"`
	DateAdded   string  `json:"dateAdded"`
	Source      string  `json:"source"`
}

func SaveDownloadedMap(filename string, fileMap map[string]DownloadedFileInfo) error {
	// Convert the map to pretty-printed JSON
	data, err := json.MarshalIndent(fileMap, "", "  ")
	if err != nil {
		return err
	}

	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(data)
	return err
}

func LoadDownloadedMap(filename string) (map[string]DownloadedFileInfo, error) {
	data := make(map[string]DownloadedFileInfo)
	file, err := os.Open(filename)
	if err != nil {
		return data, err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	err = decoder.Decode(&data)
	return data, err
}

func SaveUploadedMap(filename string, fileMap map[string]UploadedFileInfo) error {
	// Convert the map to pretty-printed JSON
	data, err := json.MarshalIndent(fileMap, "", "  ")
	if err != nil {
		return err
	}

	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(data)
	return err
}

func LoadUploadedMap(filename string) (map[string]UploadedFileInfo, error) {
	data := make(map[string]UploadedFileInfo)
	file, err := os.Open(filename)
	if err != nil {
		return data, err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	err = decoder.Decode(&data)
	return data, err
}

func RepublishFiles(fileMap map[string]UploadedFileInfo, ctx context.Context, dht *dht.IpfsDHT) {
	for cid_, fileInfo_ := range fileMap {
		if fileInfo_.Published {
			cid, err := cid.Decode(cid_)
			if err != nil {
				log.Fatal(err)
			}
			err = dht.Provide(ctx, cid, true)
			if err != nil {
				log.Fatal("Error republishing file", err)
			}
		}
	}
}

func GetFiles() []interface{} {
	var combinedFiles []interface{}

	for _, fileInfo := range uploadedFileMap {
		combinedFiles = append(combinedFiles, fileInfo)
	}

	for _, fileInfo := range downloadedFileMap {
		combinedFiles = append(combinedFiles, fileInfo)
	}
	return combinedFiles
}
