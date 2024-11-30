package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"
)

func main() {
	// intitalize p2p stuff
	node, dht, err := createNode()
	if err != nil {
		log.Fatalf("Failed to create node: %s", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	globalCtx = ctx

	fmt.Println("Node multiaddresses:", node.Addrs())
	fmt.Println("Node Peer ID:", node.ID())

	// Load uploadedFileMap in
	uploadedFileMap, err = LoadUploadedMap("uploadedFileMap.json")
	if err != nil {
		log.Print(err)
	}

	// Load downloadedFileMap in
	downloadedFileMap, err = LoadDownloadedMap("downloadedFileMap.json")
	if err != nil {
		log.Print(err)
	}

	connectToPeer(node, relay_node_addr) // connect to relay node
	makeReservation(node)                // make reservation on realy node
	go refreshReservation(node, 10*time.Minute)
	connectToPeer(node, bootstrap_node_addr) // connect to bootstrap node

	go handlePeerExchange(node)
	handleProviderInfoRequests(node)
	handleFileRequests(node)
	defer node.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/createWallet", HandleCreateWallet)
	mux.HandleFunc("/loginWallet", HandleLoginWallet)
	mux.HandleFunc("/sanity_check", SanityRoute)
	mux.HandleFunc("/shared_link", ServeFile)
	mux.HandleFunc("/generateFileLink", GenerateFileLink)
	// p2p file sharing routes
	mux.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
		uploadFile(ctx, dht, w, r)
	})
	mux.HandleFunc("/providers/{cid}", func(w http.ResponseWriter, r *http.Request) {
		getFileProviders(ctx, dht, node, w, r)
	})
	mux.HandleFunc("/download/{cid}/{targetpeerid}", func(w http.ResponseWriter, r *http.Request) {
		downloadFile(node, w, r)
	})
	mux.HandleFunc("/files", getAllFiles)

	fmt.Println("Server is running on port 8080")
	handler := enableCORS(mux)
	log.Fatal(http.ListenAndServe(":8080", handler))

}
