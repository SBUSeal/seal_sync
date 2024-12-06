package main

import (
	"fmt"
	"log"
	"net/http"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins (or restrict to specific domains)
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	privateIP, err := getPrivateIP()
	if err != nil {
		fmt.Println("Error retrieving public IP:", err)
	} else {
		fmt.Println("Server Private IP Address:", privateIP)
	}
	go startTransferServer(privateIP)

	mux := http.NewServeMux()
	// mux.HandleFunc("/createWallet", HandleCreateWallet)
	// mux.HandleFunc("/loginWallet", HandleLoginWallet)
	// mux.HandleFunc("/sanity_check", SanityRoute)
	mux.HandleFunc("/shared_link", ServeFile)
	mux.HandleFunc("/generateFileLink", GenerateFileLink)

	handler := enableCORS(mux)
	log.Fatal(http.ListenAndServe(":8080", handler))
	select {}

}
