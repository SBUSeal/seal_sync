package main

import (
	"context"
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/ipfs/go-cid"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/multiformats/go-multihash"
)

// Handle CORS issues
func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// parse the form data to get the file, generate the cid, then Provide it on the dht
func uploadFile(ctx context.Context, dht *dht.IpfsDHT, w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	//must be a POST request
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the multipart form
	err := r.ParseMultipartForm(50 << 20) // 50 MB limit for now
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	// Get the file from the form
	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Create the CID
	cid := generateCid(file)

	// Send the CID back in the response for now
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"CID": "%s"}`, cid.String())

	err = dht.Provide(ctx, cid, true)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Successfully announced ourself as a provider of: ", cid)
}

// download a file from the DHT (not finished)
func downloadFile(ctx context.Context, dht *dht.IpfsDHT, w http.ResponseWriter, r *http.Request) {
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
	fmt.Println("Finding providers for cid: ", cid)
	providers := dht.FindProvidersAsync(ctx, cid, 20)

	fmt.Println("Searching for providers...")
	// For now just printing the providers to the terminal
	for p := range providers {
		if p.ID == peer.ID("") {
			break
		}
		fmt.Printf("Found provider: %s\n", p.ID.String())
		for _, addr := range p.Addrs {
			fmt.Printf(" - Address: %s\n", addr.String())
		}
	}

}

// Pass ctx and dht in
func startHttpServer(ctx context.Context, dht *dht.IpfsDHT) {
	router := http.NewServeMux()
	router.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
		uploadFile(ctx, dht, w, r)
	})
	router.HandleFunc("/download/{cid}", func(w http.ResponseWriter, r *http.Request) {
		downloadFile(ctx, dht, w, r)
	})

	err := http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
	fmt.Println("Server is running on port 8080")
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
