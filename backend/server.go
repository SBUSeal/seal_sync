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

	"github.com/ipfs/go-cid"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/multiformats/go-multihash"
)

// Handle CORS issues
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Expose-Headers", "Content-Disposition")
}

// Find all Peer IDs in the list of peer.AddrInfos
func findAllPeerIDs(peerInfos []peer.AddrInfo) []string {
	var arr []string
	for _, peerInfo := range peerInfos {
		arr = append(arr, peerInfo.ID.String())
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

func saveFile(file multipart.File, header *multipart.FileHeader, w http.ResponseWriter) cid.Cid {
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
		http.Error(w, "Error creating file", http.StatusInternalServerError)
	}
	defer uploadedFile.Close()

	// Copy the contents of the multipart.File to the new file
	bytes, err := io.Copy(uploadedFile, file)
	if err != nil {
		log.Fatal("failed to copy file", err)
	}
	fmt.Println("Successfully copied", bytes, " bytes of the multipart file")

	return cid
}

// Get the provided file and price, save a copy to the ./uploads folder, and upload to DHT
func uploadFile(ctx context.Context, dht *dht.IpfsDHT, w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// Get provided price
	price_s := r.FormValue("price")
	price, err := strconv.ParseFloat(price_s, 64)
	if err != nil {
		log.Fatal(err)
	}
	// Get provided file
	file, header, err := getFileFromRequest(r)
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
	}
	defer file.Close()

	cid := saveFile(file, header, w)
	// add to cidMap
	fileInfo := FileInfo{FilePath: filepath.Join("uploads", header.Filename), Price: price}
	cidMap[cid.String()] = fileInfo

	// Announce as a provider for the CID
	err = dht.Provide(ctx, cid, true)
	if err != nil {
		log.Fatal(err)
	}
	w.WriteHeader(http.StatusOK)

	_, err = w.Write([]byte(cid.String()))
	if err != nil {
		fmt.Println("Had an error writing cid of newly uploaded file")
	}

	fmt.Println("Successfully announced as provider of: ", cid)

}

// get provider information for a given cid
func getFileProviders(ctx context.Context, dht *dht.IpfsDHT, node host.Host, w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
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
	fmt.Println("Found providers: ", providers)

	peerIDs := findAllPeerIDs(providers)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Peer Ids found: ", peerIDs)

	// maps {Peer_id: FileProviderInfo}
	var results []FileProviderInfo
	for _, peerID := range peerIDs {
		info := requestProviderInfo(node, peerID, cid)
		results = append(results, info)
	}
	fmt.Println("Got list of results: ", results)

	w.Header().Set("Content-Type", "application/json")
	jsonData, err := json.Marshal(results)
	if err != nil {
		log.Fatal("marshalling error", err)
	}
	w.Write(jsonData)

}

func downloadFile(node host.Host, w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	targetPeerID := r.PathValue("targetpeerid")
	cid := r.PathValue("cid")

	fileData := requestFile(node, targetPeerID, cid)

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", `attachment; filename="`+fileData.Name+`"`)
	_, err := w.Write(fileData.Content)
	if err != nil {
		http.Error(w, "Couldnt write file content", 500)
	}
}

// Pass ctx and dht in
func startHttpServer(ctx context.Context, dht *dht.IpfsDHT, node host.Host) {
	router := http.NewServeMux()
	router.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
		uploadFile(ctx, dht, w, r)
	})
	router.HandleFunc("/providers/{cid}", func(w http.ResponseWriter, r *http.Request) {
		getFileProviders(ctx, dht, node, w, r)
	})

	router.HandleFunc("/download/{cid}/{targetpeerid}", func(w http.ResponseWriter, r *http.Request) {
		downloadFile(node, w, r)
	})

	fmt.Println("Backend server is running on localhost port 8080")
	err := http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

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
	c := cid.NewCidV1(cid.Raw, mh)
	fmt.Println("Generated CID:", c)

	return c
}
