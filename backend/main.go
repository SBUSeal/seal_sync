package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
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
	mux := http.NewServeMux()
	mux.HandleFunc("/createWallet", HandleCreateWallet)
	mux.HandleFunc("/loginWallet", HandleLoginWallet)
	mux.HandleFunc("/sanity_check", SanityRoute)


	fmt.Println("Server is running on port 8080")
	handler := enableCORS(mux)
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func checkWalletExists(walletAddress string) bool {
	// Here you would implement the actual logic, e.g., checking wallet files or a database.
	// For now, we'll just assume the wallet exists if it's non-empty.
	return walletAddress != ""
}


func SanityRoute(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{"message": "Server is running smoothly!"}
	json.NewEncoder(w).Encode(response)
}
func HandleCreateWallet(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var requestBody struct {
		WalletName string `json:"walletName"`
		WalletPassword string `json:"walletPassword"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if requestBody.WalletName == "" {
		http.Error(w, "Wallet name is required", http.StatusBadRequest)
		return
	}

	// Step 1: Create the wallet
	createWalletReq := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "createwallet",
		"params":  []string{requestBody.WalletName},
	}
	createWalletBody, err := json.Marshal(createWalletReq)
	if err != nil {
		http.Error(w, "Failed to create RPC request", http.StatusInternalServerError)
		return
	}

	client := &http.Client{}
	req, err := http.NewRequest("POST", "http://127.0.0.1:8332", bytes.NewBuffer(createWalletBody))
	if err != nil {
		http.Error(w, "Failed to create HTTP request", http.StatusInternalServerError)
		return
	}
	req.SetBasicAuth("user", "password") // Replace with your RPC credentials
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to connect to Bitcoin Core", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read response from Bitcoin Core", http.StatusInternalServerError)
		return
	}

	var createWalletResponse map[string]interface{}
	if err := json.Unmarshal(respBody, &createWalletResponse); err != nil {
		http.Error(w, "Failed to parse wallet creation response", http.StatusInternalServerError)
		return
	}

	if createWalletResponse["error"] != nil {
		http.Error(w, fmt.Sprintf("Error creating wallet: %v", createWalletResponse["error"]), http.StatusInternalServerError)
		return
	}

	// Step 2: Generate a new address in the created wallet
	getNewAddressReq := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "getnewaddress",
		"params":  []string{},
	}
	getNewAddressBody, err := json.Marshal(getNewAddressReq)
	if err != nil {
		http.Error(w, "Failed to create address request", http.StatusInternalServerError)
		return
	}

	req, err = http.NewRequest("POST", "http://127.0.0.1:8332/wallet/"+requestBody.WalletName, bytes.NewBuffer(getNewAddressBody))
	if err != nil {
		http.Error(w, "Failed to create HTTP request for new address", http.StatusInternalServerError)
		return
	}
	req.SetBasicAuth("user", "password")
	req.Header.Set("Content-Type", "application/json")

	resp, err = client.Do(req)
	if err != nil {
		http.Error(w, "Failed to connect to Bitcoin Core for new address", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	respBody, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read response for new address", http.StatusInternalServerError)
		return
	}

	var getNewAddressResponse map[string]interface{}
	if err := json.Unmarshal(respBody, &getNewAddressResponse); err != nil {
		http.Error(w, "Failed to parse new address response", http.StatusInternalServerError)
		return
	}

	if getNewAddressResponse["error"] != nil {
		http.Error(w, fmt.Sprintf("Error generating new address: %v", getNewAddressResponse["error"]), http.StatusInternalServerError)
		return
	}

	// Step 3: Return the wallet address
	walletAddress := getNewAddressResponse["result"].(string)
	response := map[string]string{"walletAddress": walletAddress}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func HandleLoginWallet(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }

    var requestBody struct {
        WalletAddress string `json:"walletAddress"`
    }
    if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Logic to validate wallet address
    // Example: Check if the wallet exists
    walletExists := checkWalletExists(requestBody.WalletAddress) // You need to implement this function

    if !walletExists {
        http.Error(w, "Wallet not found", http.StatusNotFound)
        return
    }

    // If valid, send a success response
    response := map[string]string{"message": "Login successful!"}
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
