package main

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/ipfs/go-cid"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/multiformats/go-multihash"
)

// Find all Peer IDs in the list of peer.AddrInfos (excluding ourselves)
func findAllPeerIDs(node host.Host, peerInfos []peer.AddrInfo) []string {
	var arr []string
	for _, peerInfo := range peerInfos {
		if peerInfo.ID.String() != node.ID().String() {
			arr = append(arr, peerInfo.ID.String())
		}
	}
	return arr
}

func getFileFromRequest(r *http.Request) (multipart.File, *multipart.FileHeader, error) {
	err := r.ParseMultipartForm(50 << 20) // 50 MB limit
	if err != nil {
		return nil, nil, err
	}
	file, header, err := r.FormFile("file")
	return file, header, err
}

func saveUploadedFile(file multipart.File, header *multipart.FileHeader) cid.Cid {
	// Create cid for the file
	cid := generateCid(file)

	// Reset file pointer
	_, err := file.Seek(0, io.SeekStart)
	if err != nil {
		log.Fatalf("Failed to reset file pointer: %v", err)
	}

	// Create the uploads directory if it doesn't exist
	err = os.MkdirAll("uploads", os.ModePerm)
	if err != nil {
		log.Fatal("failed to create directory")
	}

	// Create copy of file in /uploads
	uploadedFile, err := os.Create(filepath.Join("uploads", header.Filename))
	if err != nil {
		log.Fatal("Error creating copy of file to /uploads: ", err)
	}
	defer uploadedFile.Close()

	// Copy the contents of the multipart.File to the new file
	_, err = io.Copy(uploadedFile, file)
	if err != nil {
		log.Fatal("failed to copy file", err)
	}
	return cid
}

func processUploadedFile(r *http.Request) (cid.Cid, UploadedFileInfo) {
	// Get provided file metadata
	price_s := r.FormValue("price")
	price, err := strconv.ParseFloat(price_s, 64)
	if err != nil {
		log.Fatal(err)
	}
	description := r.FormValue("description")
	dateAdded := r.FormValue("dateAdded")
	unpublishTime_s := r.FormValue("unpublishTime")
	var unpublishTime time.Time
	if unpublishTime_s == "" {
		unpublishTime = time.Time{}
	} else {
		unpublishTime, err = time.Parse("2006-01-02T15:04", unpublishTime_s)
		if err != nil {
			log.Fatal("Error parsing the time: ", err)
		}
	}
	size_s := r.FormValue("size")
	size, err := strconv.ParseInt(size_s, 10, 64)
	if err != nil {
		log.Fatal(err)
	}
	// Get provided file
	file, header, err := getFileFromRequest(r)
	if err != nil {
		log.Fatal("Error with getFileFromRequest: ", err)
	}
	defer file.Close()

	cid := saveUploadedFile(file, header)

	// Add file to uploadedFileMap
	fileInfo := UploadedFileInfo{
		Name:          header.Filename,
		Price:         price,
		Description:   description,
		Size:          size,
		Cid:           cid.String(),
		Published:     true,
		UnpublishTime: unpublishTime,
		DateAdded:     dateAdded,
		Source:        "uploaded",
	}
	uploadedFileMap[cid.String()] = fileInfo
	//Save uploadedFileMap
	err = SaveUploadedMap("uploadedFileMap.json", uploadedFileMap)
	if err != nil {
		log.Fatal(err)
	}
	return cid, fileInfo
}

// Get the provided file, save it, and upload to DHT. Send back metadata as response
func uploadFile(ctx context.Context, dht *dht.IpfsDHT, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract file metadata and save copy of file to /uploads
	cid, fileInfo := processUploadedFile(r)

	// Announce as a provider for the CID
	err := dht.Provide(ctx, cid, true)
	if err != nil {
		log.Fatal(err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	// Write the file metadata as a response
	newFileInfo, err := json.Marshal(fileInfo)
	if err != nil {
		log.Fatal("marshalling error", err)
	}
	w.Write(newFileInfo)
	fmt.Println("Successfully announced as provider of: ", cid)
}

// Get provider information for a given cid
func getFileProviders(ctx context.Context, dht *dht.IpfsDHT, node host.Host, w http.ResponseWriter, r *http.Request) {
	// must be a GET request
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// Get the provided cid
	cid, err := cid.Decode(r.PathValue("cid"))
	if err != nil {
		log.Fatal(err)
	}

	// Search for providers of this cid
	providers, err := dht.FindProviders(ctx, cid)
	if err != nil {
		log.Fatal(err)
	}

	// Get the providers peer ids
	peerIDs := findAllPeerIDs(node, providers)
	if err != nil {
		log.Fatal(err)
	}

	var results []FileProviderInfo
	for _, peerID := range peerIDs {
		info := requestProviderInfo(node, peerID, cid)
		results = append(results, info)
	}
	w.Header().Set("Content-Type", "application/json")
	providersJson, err := json.Marshal(results)
	if err != nil {
		log.Fatal("marshalling error", err)
	}
	w.Write(providersJson)

}

func saveDownloadedFile(fileData FileMetadata, cid string, downloadStream network.Stream) {
	// Create the downloads directory if it doesn't exist
	err := os.MkdirAll("downloads", os.ModePerm)
	if err != nil {
		log.Fatal("failed to create downloads directory")
	}

	// Create copy of file in /downloads
	downloadedFile, err := os.Create(filepath.Join("downloads", fileData.Name))
	if err != nil {
		log.Fatal("Error creating file in /downloads: ", err)
	}
	_, err = io.Copy(downloadedFile, downloadStream)
	if err != nil {
		log.Fatal("Error saving copy of file to /downloads: ", err)
	}
	downloadedFile.Close()

	newlyDownloadedFile := DownloadedFileInfo{
		Name:        fileData.Name,
		Price:       fileData.Price,
		Description: "Downloaded from seal network",
		Size:        fileData.Size,
		Cid:         cid,
		DateAdded:   time.Now().Format(time.RFC3339),
		Source:      "downloaded",
	}
	// Add file to downloadedFileMap
	downloadedFileMap[cid] = newlyDownloadedFile

	//Save downloadedFileMap
	err = SaveDownloadedMap("downloadedFileMap.json", downloadedFileMap)
	if err != nil {
		log.Fatal(err)
	}
}

func writeFileToResponse(w http.ResponseWriter, filename string) int64 {
	downloadedFile, err := os.Open(filename)
	if err != nil {
		log.Fatal("Error reading saved file: ", err)
	}
	defer downloadedFile.Close()

	w.Header().Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	nbytes, err := io.Copy(w, downloadedFile)
	if err != nil {
		log.Fatal(err)
	}
	return nbytes
}

func downloadFile(node host.Host, w http.ResponseWriter, r *http.Request) {
	targetPeerID := r.PathValue("targetpeerid")
	cid := r.PathValue("cid")
	fileData, downloadStream := requestFile(node, targetPeerID, cid)
	defer downloadStream.Close()
	// For a HEAD request, just send the metadata through headers
	if r.Method == http.MethodHead {
		w.Header().Set("Name", fileData.Name)
		w.Header().Set("Price", strconv.FormatFloat(fileData.Price, 'f', -1, 64))
		w.Header().Set("Description", "Downloaded from Seal network")
		w.Header().Set("Size", strconv.FormatInt(fileData.Size, 10))
		w.Header().Set("Cid", cid)
		w.Header().Set("DateAdded", time.Now().Format(time.RFC3339))
		w.Header().Set("Source", "downloaded")
		w.WriteHeader(http.StatusOK)
		return
	}

	// Save copy of file to /downloads and update downloadedFileMap
	saveDownloadedFile(fileData, cid, downloadStream)

	// Send the file as response
	nbytes := writeFileToResponse(w, filepath.Join("downloads", fileData.Name))
	log.Printf(" (server.go) Downloaded file %s, streamed %d bytes\n", fileData.Name, nbytes)
}

func getAllFiles(w http.ResponseWriter, r *http.Request) {
	allFiles := GetFiles()
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(allFiles)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// Pass ctx and dht in
// func startHttpServer(ctx context.Context, dht *dht.IpfsDHT, node host.Host) {
// 	router := http.NewServeMux()
// 	router.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
// 		uploadFile(ctx, dht, w, r)
// 	})
// 	router.HandleFunc("/providers/{cid}", func(w http.ResponseWriter, r *http.Request) {
// 		getFileProviders(ctx, dht, node, w, r)
// 	})
// 	router.HandleFunc("/download/{cid}/{targetpeerid}", func(w http.ResponseWriter, r *http.Request) {
// 		downloadFile(node, w, r)
// 	})
// 	router.HandleFunc("/files", getAllFiles)

// 	fmt.Println("Backend server is running on localhost port 8080")
// 	err := http.ListenAndServe(":8080", router)
// 	if err != nil {
// 		log.Fatal("ListenAndServe: ", err)
// 	}
// }

func generateCid(file io.Reader) cid.Cid {
	// Create sha-256 hash
	hash := sha256.New()
	_, err := io.Copy(hash, file)
	if err != nil {
		log.Fatal(err)
	}
	fileHash := hash.Sum(nil)

	// Create multihash
	mh, err := multihash.Encode(fileHash, multihash.SHA2_256)
	if err != nil {
		log.Fatal(err)
	}

	// Create the CID
	return cid.NewCidV1(cid.Raw, mh)
}
