package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"

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

// Find all private IP addresses in the list of multiaddresses
func findAllPrivateIPs(multiaddrs []multiaddr.Multiaddr) ([]string, error) {
	privateIPs := []string{} // Slice to store all private IPs found

	for _, maddr := range multiaddrs {
		// Extract the IP part from the multiaddress
		addr, err := maddr.ValueForProtocol(multiaddr.P_IP4)
		if err != nil {
			log.Println("Error extracting IP:", err)
			continue
		}

		if isPrivateIP(addr) {
			privateIPs = append(privateIPs, addr) // Add the private IP to the slice
		}
	}

	if len(privateIPs) == 0 {
		return nil, fmt.Errorf("no private IP addresses found")
	}
	return privateIPs, nil // Return the list of private IPs
}

// Get all providers for a given cid
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

func getFileFromRequest(r *http.Request) (multipart.File, *multipart.FileHeader, error) {
	err := r.ParseMultipartForm(50 << 20) // 50 MB limit
	if err != nil {
		return nil, nil, err
	}
	file, header, err := r.FormFile("file")
	return file, header, err
}

func saveFile(file multipart.File, header *multipart.FileHeader, w http.ResponseWriter) cid.Cid {
	// Read the file into a buffer
	var buf bytes.Buffer
	_, err := io.Copy(&buf, file)
	if err != nil {
		http.Error(w, "Error reading file", http.StatusInternalServerError)
	}
	// Create a new reader from the buffer for generating the CID
	cid := generateCid(bytes.NewReader(buf.Bytes()))

	// Create the file on disk
	outFile, err := os.Create("./uploads/" + header.Filename)
	if err != nil {
		http.Error(w, "Error creating file", http.StatusInternalServerError)
	}
	defer outFile.Close()

	// Write the buffer to the file on disk
	_, err = buf.WriteTo(outFile)
	if err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
	}

	return cid
}

// Get the provided file and price, save a copy to the ./uploads folder, and upload to DHT
func uploadFile(ctx context.Context, dht *dht.IpfsDHT, w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// Get provided price
	price_s := r.FormValue("price")
	price, err := strconv.Atoi(price_s)
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
	fileInfo := FileInfo{FilePath: "./uploads/" + header.Filename, Price: price}
	cidMap[cid.String()] = fileInfo

	// Announce as a provider for the CID
	err = dht.Provide(ctx, cid, true)
	if err != nil {
		log.Fatal(err)
	}
	w.WriteHeader(http.StatusOK)
	fmt.Println("Successfully announced as provider of: ", cid)
}

// get providers and their prices for a given cid
func getFileProviders(ctx context.Context, dht *dht.IpfsDHT, w http.ResponseWriter, r *http.Request) {
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

	ipAddresses, err := findAllPrivateIPs(providers)
	if err != nil {
		log.Fatal(err)
	}
	// maps {ip: price}
	var results []map[string]string

	for _, ip := range ipAddresses {
		resp, err := http.Get("http://" + ip + ":8081" + "/price/" + cid.String())
		if err != nil {
			log.Fatal(err)
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
		}
		price := string(body)
		results = append(results, map[string]string{"ip": ip, "price": price})
	}

	// Set the response header to JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		log.Fatal(err)
	}
}

// Pass ctx and dht in
func startHttpServer(ctx context.Context, dht *dht.IpfsDHT) {
	router := http.NewServeMux()
	router.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
		uploadFile(ctx, dht, w, r)
	})
	router.HandleFunc("/providers/{cid}", func(w http.ResponseWriter, r *http.Request) {
		getFileProviders(ctx, dht, w, r)
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
