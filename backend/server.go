package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/ipfs/go-cid"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/multiformats/go-multiaddr"
	"github.com/multiformats/go-multihash"
)

// Handle CORS issues
func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Expose-Headers", "Content-Disposition")
}

// Find the first private IP address in the list of multiaddresses
func findFirstPrivateIP(multiaddrs []multiaddr.Multiaddr) (string, error) {
	for _, maddr := range multiaddrs {
		// Extract the IP part from the multiaddress
		addr, err := maddr.ValueForProtocol(multiaddr.P_IP4)
		if err != nil {
			log.Println("Error extracting IP:", err)
			continue
		}

		if isPrivateIP(addr) {
			return addr, nil // Return the first private IP found
		}
	}
	return "", fmt.Errorf("no private IP address found")
}

func getProviderAddresses(ctx context.Context, dht *dht.IpfsDHT, cid cid.Cid) []multiaddr.Multiaddr {
	var addresses []multiaddr.Multiaddr

	providers := dht.FindProvidersAsync(ctx, cid, 20)
	for provider := range providers {
		// Add all addresses for each provider to the slice
		for _, addr := range provider.Addrs {
			addresses = append(addresses, addr)
		}
	}

	return addresses
}

// parse the form data to get the file, generate the cid, then Provide it on the dht
func uploadFile(ctx context.Context, dht *dht.IpfsDHT, w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(50 << 20) // 50 MB limit
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fmt.Println("File size: ", header.Size)

	// Read the file into a buffer
	var buf bytes.Buffer
	_, err = io.Copy(&buf, file)
	if err != nil {
		http.Error(w, "Error reading file", http.StatusInternalServerError)
		return
	}

	// Create a new reader from the buffer for generating the CID
	cid := generateCid(bytes.NewReader(buf.Bytes()))

	// Create the file on disk
	outFile, err := os.Create("./uploads/" + header.Filename)
	if err != nil {
		http.Error(w, "Error creating file", http.StatusInternalServerError)
		return
	}
	defer outFile.Close()

	// Write the buffer to the file on disk
	_, err = buf.WriteTo(outFile)
	if err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "File uploaded successfully: %s", header.Filename)
	// add to filemap
	fileMap[cid.String()] = "./uploads/" + header.Filename

	// Send the CID back in the response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"CID": "%s"}`, cid.String())

	// Announce as a provider for the CID
	err = dht.Provide(ctx, cid, true)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Successfully announced as provider of: ", cid)

}

// download a file from the DHT (not finished)
func downloadFile(ctx context.Context, dht *dht.IpfsDHT, w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
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
	providers := getProviderAddresses(ctx, dht, cid)
	// For now just printing the providers to the terminal

	ipAddress, err := findFirstPrivateIP(providers)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("ip to use: ", ipAddress)

	w.Header().Set("Content-Type", "text/plain")

	// Write a response that includes the IP address
	fmt.Fprintf(w, "%s", ipAddress)

	// request transfer server on client

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
