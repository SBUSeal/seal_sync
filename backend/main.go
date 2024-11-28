package main

import (
	"context"
	"fmt"
	"log"
	"time"
)

func main() {
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

	// Start backend server
	go startHttpServer(ctx, dht, node)

	handleProviderInfoRequests(node)
	handleFileRequests(node)
	defer node.Close()

	select {}
}
