package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

var (
	node_id               = "114418346" // give your SBU ID
	relay_node_addr       = "/ip4/130.245.173.221/tcp/4001/p2p/12D3KooWDpJ7As7BWAwRMfu1VU2WCqNjvq387JEYKDBj4kx6nXTN"
	bootstrap_node_1_addr = "/ip4/130.245.173.221/tcp/6001/p2p/12D3KooWE1xpVccUXZJWZLVWPxXzUJQ7kMqN8UQ2WLn9uQVytmdA"
	bootstrap_node_2_addr = "/ip4/130.245.173.222/tcp/61020/p2p/12D3KooWM8uovScE5NPihSCKhXe8sbgdJAi88i2aXT2MmwjGWoSX"
	globalCtx             = context.Background()
	uploadedFileMap       = make(map[string]UploadedFileInfo)
	downloadedFileMap     = make(map[string]DownloadedFileInfo)
	unpublishedFiles      = []string{}
	WALLET_ADDRESS        string
	WALLET_NAME           string
	miningEnabled         = true
	miningMutex           sync.Mutex
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins (or restrict to specific domains)
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Expose-Headers", "Name, Cid, Price, Size, Description, DateAdded, Source")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {

	go start_proxy()

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
	go refreshFileUploads(1*time.Minute, ctx, dht)
	go handleAutoUnpublish(1*time.Minute, ctx)

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

	mux.HandleFunc("/enableProxy", func(w http.ResponseWriter, r *http.Request) {
		enableProxy(w, r)
	})

	mux.HandleFunc("/startMining", HandleStartMining)
	mux.HandleFunc("/stopMining", HandleStopMining)

	mux.HandleFunc("/getBalance", HandleGetBalance)
	mux.HandleFunc("/getTransactions", HandleGetTransactions)


	fmt.Println("Server is running on port 8080")
	handler := enableCORS(mux)
	log.Fatal(http.ListenAndServe(":8080", handler))
}
