package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/createWallet", HandleCreateWallet)
	mux.HandleFunc("/loginWallet", HandleLoginWallet)
	mux.HandleFunc("/sanity_check", SanityRoute)
	mux.HandleFunc("/shared_link", ServeFile)
	mux.HandleFunc("/generateFileLink", GenerateFileLink)

	fmt.Println("Server is running on port 8080")
	handler := enableCORS(mux)
	log.Fatal(http.ListenAndServe(":8080", handler))
}


