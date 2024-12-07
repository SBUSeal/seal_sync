package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"
)

var (
	node_id             = "114418346askljdkajsdjak" // give your SBU ID
	relay_node_addr     = "/ip4/130.245.173.221/tcp/4001/p2p/12D3KooWDpJ7As7BWAwRMfu1VU2WCqNjvq387JEYKDBj4kx6nXTN"
	bootstrap_node_addr = "/ip4/130.245.173.222/tcp/61000/p2p/12D3KooWQd1K1k8XA9xVEzSAu7HUCodC7LJB6uW5Kw4VwkRdstPE"
	globalCtx           = context.Background()
	uploadedFileMap     = make(map[string]UploadedFileInfo)
	downloadedFileMap   = make(map[string]DownloadedFileInfo)
	unpublishedFiles    = []string{}
	WALLET_ADDRESS      string
	WALLET_NAME         string
)

func main() {
	privateIP, err := getPrivateIP()
	if err != nil {
		fmt.Println("Error retrieving public IP:", err)
	} else {
		fmt.Println("Server Private IP Address:", privateIP)
	}
	go startTransferServer(privateIP)

	// Initialize our node (connect to bootstrap & relay node, initialize dht)
	node, dht := initializeNode()
	defer node.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	globalCtx = ctx

	// Periodically re-Provide our uploaded files and unpublish any files that have expired
	go refreshFileUploads(10*time.Minute, ctx, dht)
	go handleAutoUnpublish(10*time.Minute, ctx)

	mux := http.NewServeMux()
	mux.HandleFunc("/sendToAddress", HandleSendToAddress)
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
	mux.HandleFunc("/unpublishFile/{cid}", unpublishFileByCid)
	mux.HandleFunc("/publishFile/{cid}", func(w http.ResponseWriter, r *http.Request) {
		publishFileByCid(ctx, dht, w, r)
	})
	mux.HandleFunc("/deleteUploadedFile/{cid}", deleteUploadedFile)
	mux.HandleFunc("/deleteDownloadedFile/{cid}", deleteDownloadedFile)

	fmt.Println("Server is running on port 8080")
	handler := enableCORS(mux)
	log.Fatal(http.ListenAndServe(":8080", handler))

}
