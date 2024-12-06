package main

import (
	"context"
	"encoding/json"
	"io"
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

// Remove an element from a string slice
func remove(slice []string, value string) []string {
	for i, v := range slice {
		if v == value {
			return append(slice[:i], slice[i+1:]...)
		}
	}
	return slice
}

func SaveDownloadedMap(fileMap map[string]DownloadedFileInfo) error {
	// Convert the map to pretty-printed JSON
	data, err := json.MarshalIndent(fileMap, "", "  ")
	if err != nil {
		return err
	}

	file, err := os.Create("downloadedFileMap.json")
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(data)
	return err
}

func LoadDownloadedMap() map[string]DownloadedFileInfo {
	// Create the file if it doesn't exist
	if _, err := os.Stat("downloadedFileMap.json"); os.IsNotExist(err) {
		_, err := os.Create("downloadedFileMap.json")
		if err != nil {
			log.Fatal("Failed to create file:", err)
		}
	}

	file, err := os.Open("downloadedFileMap.json")
	if err != nil {
		log.Fatal("Failed to open file:", err)
	}
	defer file.Close()

	data := make(map[string]DownloadedFileInfo)
	if err := json.NewDecoder(file).Decode(&data); err != nil && err != io.EOF {
		log.Fatal("Failed to decode JSON:", err)
	}

	return data
}

func SaveUploadedMap(fileMap map[string]UploadedFileInfo) error {
	// Convert the map to pretty-printed JSON
	data, err := json.MarshalIndent(fileMap, "", "  ")
	if err != nil {
		return err
	}

	file, err := os.Create("uploadedFileMap.json")
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(data)
	return err
}

func LoadUploadedMap() map[string]UploadedFileInfo {
	// Create the file if it doesn't exist
	if _, err := os.Stat("uploadedFileMap.json"); os.IsNotExist(err) {
		_, err := os.Create("uploadedFileMap.json")
		if err != nil {
			log.Fatal("Failed to create file:", err)
		}
	}

	file, err := os.Open("uploadedFileMap.json")
	if err != nil {
		log.Fatal("Failed to open file:", err)
	}
	defer file.Close()

	data := make(map[string]UploadedFileInfo)
	if err := json.NewDecoder(file).Decode(&data); err != nil && err != io.EOF {
		log.Fatal("Failed to decode JSON:", err)
	}

	return data
}

func SaveUnpublishedFiles(slice []string) {
	file, err := os.Create("unpublishedFiles.json")
	if err != nil {
		log.Fatal("Error creating unpublished files file: ", err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	err = encoder.Encode(slice)
	if err != nil {
		log.Fatal("Error encoding unpublished files", err)
	}
}

func LoadUnpublishedFiles() []string {
	// Create the file if it doesn't exist
	if _, err := os.Stat("unpublishedFiles.json"); os.IsNotExist(err) {
		_, err := os.Create("unpublishedFiles.json")
		if err != nil {
			log.Fatal("Failed to create file:", err)
		}
	}

	file, err := os.Open("unpublishedFiles.json")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	var slice []string
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&slice)
	if err != nil {
		if err.Error() != "EOF" {
			log.Fatal(err)
		}
	}

	return slice
}

// Is the file in our list of unpublished cids
func hasBeenUnpublished(cid string) bool {
	for _, v := range unpublishedFiles {
		if v == cid {
			return true
		}
	}
	return false
}

func RepublishFiles(fileMap map[string]UploadedFileInfo, ctx context.Context, dht *dht.IpfsDHT) {
	for cid_, fileInfo_ := range fileMap {
		if fileInfo_.Published {
			PublishFile(cid_, ctx, dht)
		}
	}
}

func UnpublishFile(cid string) {
	file, exists := uploadedFileMap[cid]
	if !exists {
		log.Println("The file we are trying to unpublish does not exist in our map")
		return
	}
	file.Published = false
	uploadedFileMap[cid] = file
	SaveUploadedMap(uploadedFileMap)

	// Add to our list of unpublished cids
	unpublishedFiles = append(unpublishedFiles, cid)
	SaveUnpublishedFiles(unpublishedFiles)

	log.Println("Unpublished File: ", file.Name)

}

func PublishFile(cid_s string, ctx context.Context, dht *dht.IpfsDHT) {
	file, exists := uploadedFileMap[cid_s]
	if !exists {
		log.Println("The file we are trying to publish does not exist in our map")
		return
	}
	file.Published = true
	uploadedFileMap[cid_s] = file
	SaveUploadedMap(uploadedFileMap)

	// Remove from unpublished list
	if hasBeenUnpublished(cid_s) {
		unpublishedFiles = remove(unpublishedFiles, cid_s)
		SaveUnpublishedFiles(unpublishedFiles)
	}
	// Announce on dht
	cid, err := cid.Decode(cid_s)
	if err != nil {
		log.Fatal("Error decoding cid: ", err)
	}
	// Announce as a provider for the CID
	err = dht.Provide(ctx, cid, true)
	if err != nil {
		log.Fatal("DHT Provide Error: ", err)
	}

	log.Println("Published File: ", file.Name)

}

func DeleteUploadedFile(cid string) {
	delete(uploadedFileMap, cid)
	err := SaveUploadedMap(uploadedFileMap)
	if err != nil {
		log.Println("Error deleting uploaded file from map")
	}
}

func DeleteDownloadedFile(cid string) {
	delete(downloadedFileMap, cid)
	err := SaveDownloadedMap(downloadedFileMap)
	if err != nil {
		log.Println("Error deleting uploaded file from map")
	}
}

func autoUnpublishFiles() {
	var expiredUploads []UploadedFileInfo
	for _, fileInfo := range uploadedFileMap {
		if time.Now().After(fileInfo.UnpublishTime) {
			expiredUploads = append(expiredUploads, fileInfo)
		}
	}
	for _, file := range expiredUploads {
		UnpublishFile(file.Cid)
	}
}

func handleAutoUnpublish(interval time.Duration, ctx context.Context) {

	// Run the function initially after 5 seconds
	initialTimer := time.NewTimer(5 * time.Second)
	defer initialTimer.Stop()
	select {
	case <-initialTimer.C:
		log.Println("Initial AutoUnpublish")

	case <-ctx.Done():
		log.Println("Context done before initial AutoUnpublish, now stopping")
		return
	}

	// Run at regular intervals
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			log.Println("Checking for Expired Files Now...")
			autoUnpublishFiles()
		case <-ctx.Done():
			log.Println("Context done, stopping auto unpublish refresh.")
			return
		}
	}
}

func refreshFileUploads(interval time.Duration, ctx context.Context, dht *dht.IpfsDHT) {

	// Run the function initially after 5 seconds
	initialTimer := time.NewTimer(5 * time.Second)
	defer initialTimer.Stop()
	select {
	case <-initialTimer.C:
		log.Println("Initial Republishing")
		RepublishFiles(uploadedFileMap, ctx, dht)
	case <-ctx.Done():
		log.Println("Context done before initial republishing, now stopping")
		return
	}

	// Run at regular intervals
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			log.Println("Republishing Uploaded Files Now...")
			RepublishFiles(uploadedFileMap, ctx, dht)
		case <-ctx.Done():
			log.Println("Context done, stopping reservation refresh.")
			return
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
