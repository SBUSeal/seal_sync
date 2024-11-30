package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

type RPCResponse struct {
	Result interface{}            `json:"result"`
	Error  map[string]interface{} `json:"error"`
	ID     string                 `json:"id"`
}

func IdentifyWalletByAddress(address string) (string, error) {
	client := &http.Client{}

	// Step 1: List all loaded wallets
	listWalletsReq := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "listwallets",
		"params":  []interface{}{},
	}
	listWalletsBody, _ := json.Marshal(listWalletsReq)

	req, err := http.NewRequest("POST", "http://127.0.0.1:8332", bytes.NewBuffer(listWalletsBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request for listwallets: %v", err)
	}
	req.SetBasicAuth("user", "password")
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to connect to Bitcoin Core: %v", err)
	}
	defer resp.Body.Close()

	respBody, _ := ioutil.ReadAll(resp.Body)

	var walletsResponse RPCResponse
	if err := json.Unmarshal(respBody, &walletsResponse); err != nil {
		return "", fmt.Errorf("failed to parse listwallets response: %v", err)
	}

	if walletsResponse.Error != nil {
		return "", fmt.Errorf("error from listwallets: %v", walletsResponse.Error)
	}

	loadedWallets := walletsResponse.Result.([]interface{})

	// Step 2: Iterate through each wallet and check the address
	for _, wallet := range loadedWallets {
		walletName := wallet.(string)

		// RPC request to check address info
		getAddressInfoReq := map[string]interface{}{
			"jsonrpc": "1.0",
			"id":      "curltext",
			"method":  "getaddressinfo",
			"params":  []interface{}{address},
		}
		getAddressInfoBody, _ := json.Marshal(getAddressInfoReq)

		req, err := http.NewRequest("POST", "http://127.0.0.1:8332/wallet/"+walletName, bytes.NewBuffer(getAddressInfoBody))
		if err != nil {
			log.Printf("Failed to create request for wallet: %s, error: %v", walletName, err)
			continue
		}
		req.SetBasicAuth("user", "password")
		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Failed to connect to wallet: %s, error: %v", walletName, err)
			continue
		}
		defer resp.Body.Close()

		respBody, _ := ioutil.ReadAll(resp.Body)
		var addressInfoResponse RPCResponse
		if err := json.Unmarshal(respBody, &addressInfoResponse); err != nil {
			log.Printf("Failed to parse getaddressinfo response for wallet: %s, error: %v", walletName, err)
			continue
		}

		// Check if the address belongs to the wallet
		if addressInfoResponse.Result != nil {
			result := addressInfoResponse.Result.(map[string]interface{})
			if isMine, ok := result["ismine"].(bool); ok && isMine {
				return walletName, nil
			}
		}
	}

	return "", fmt.Errorf("address not found in any loaded wallet")
}
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
		WalletName     string `json:"walletName"`
		WalletPassword string `json:"walletPassword"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if requestBody.WalletName == "" || requestBody.WalletPassword == "" {
		http.Error(w, "Wallet name and password are required", http.StatusBadRequest)
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

	// Step 2: Encrypt the wallet with the provided password
	encryptWalletReq := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "encryptwallet",
		"params":  []string{requestBody.WalletPassword},
	}
	encryptWalletBody, err := json.Marshal(encryptWalletReq)
	if err != nil {
		http.Error(w, "Failed to create encrypt RPC request", http.StatusInternalServerError)
		return
	}

	req, err = http.NewRequest("POST", "http://127.0.0.1:8332/wallet/"+requestBody.WalletName, bytes.NewBuffer(encryptWalletBody))
	if err != nil {
		http.Error(w, "Failed to create HTTP request for encryption", http.StatusInternalServerError)
		return
	}
	req.SetBasicAuth("user", "password")
	req.Header.Set("Content-Type", "application/json")

	resp, err = client.Do(req)
	if err != nil {
		http.Error(w, "Failed to connect to Bitcoin Core for encryption", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	respBody, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read encryption response", http.StatusInternalServerError)
		return
	}

	var encryptWalletResponse map[string]interface{}
	if err := json.Unmarshal(respBody, &encryptWalletResponse); err != nil {
		http.Error(w, "Failed to parse encryption response", http.StatusInternalServerError)
		return
	}

	if encryptWalletResponse["error"] != nil {
		http.Error(w, fmt.Sprintf("Error encrypting wallet: %v", encryptWalletResponse["error"]), http.StatusInternalServerError)
		return
	}

	// Step 3: Generate a new address in the encrypted wallet
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

	// Step 4: Return the wallet address
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
		WalletAddress  string `json:"walletAddress"`
		WalletPassword string `json:"walletPassword"`
	}

	// Decode the JSON request body
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if requestBody.WalletAddress == "" || requestBody.WalletPassword == "" {
		http.Error(w, "Wallet address and password are required", http.StatusBadRequest)
		return
	}

	client := &http.Client{}

	WalletName, err := IdentifyWalletByAddress(requestBody.WalletAddress)
	if err != nil {
		fmt.Printf("Error identifying wallet: %v\n", err)
		return
	}

	// Step 1: Attempt to load the wallet
	loadWalletReq := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "loadwallet",
		"params":  []string{WalletName},
	}
	loadWalletBody, _ := json.Marshal(loadWalletReq)
	req, err := http.NewRequest("POST", "http://127.0.0.1:8332", bytes.NewBuffer(loadWalletBody))
	if err != nil {
		http.Error(w, "Failed to create HTTP request for loading wallet", http.StatusInternalServerError)
		return
	}
	req.SetBasicAuth("user", "password") // Replace with your RPC credentials
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to connect to Bitcoin Core for loading wallet", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	respBody, _ := ioutil.ReadAll(resp.Body)
	var loadWalletResponse map[string]interface{}
	json.Unmarshal(respBody, &loadWalletResponse)

	// Handle the case where the wallet is already loaded
	if loadWalletResponse["error"] != nil {
		errorCode := loadWalletResponse["error"].(map[string]interface{})["code"].(float64)
		// Ignore error code -35 (wallet already loaded)
		if errorCode != -35 {
			http.Error(w, fmt.Sprintf("Error loading wallet: %v", loadWalletResponse["error"]), http.StatusNotFound)
			return
		}
	}

	// Step 2: Unlock the wallet using walletpassphrase
	rpcRequest := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "walletpassphrase",
		"params":  []interface{}{requestBody.WalletPassword, 60}, // Unlock for 60 seconds
	}
	rpcRequestBody, _ := json.Marshal(rpcRequest)
	req, err = http.NewRequest("POST", "http://127.0.0.1:8332/wallet/"+WalletName, bytes.NewBuffer(rpcRequestBody))
	if err != nil {
		http.Error(w, "Failed to create HTTP request for unlocking wallet", http.StatusInternalServerError)
		return
	}
	req.SetBasicAuth("user", "password")
	req.Header.Set("Content-Type", "application/json")

	resp, err = client.Do(req)
	if err != nil {
		http.Error(w, "Failed to connect to Bitcoin Core for unlocking wallet", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	respBody, _ = ioutil.ReadAll(resp.Body)
	var rpcResponse map[string]interface{}
	json.Unmarshal(respBody, &rpcResponse)

	// Handle errors from walletpassphrase
	if rpcResponse["error"] != nil {
		http.Error(w, fmt.Sprintf("Error unlocking wallet: %v", rpcResponse["error"]), http.StatusUnauthorized)
		return
	}

	// Step 3: Return a success message
	response := map[string]string{"message": "Login successful!"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
