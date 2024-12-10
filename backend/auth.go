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

// This is a new version that works even if the
// wallet you're trying to log in with is not currently loaded
func IdentifyWalletByAddress(address string) (string, error) {
	client := &http.Client{}

	// Step 1: List all available wallets
	listWalletDirReq := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "listwalletdir",
		"params":  []interface{}{},
	}
	listWalletDirBody, _ := json.Marshal(listWalletDirReq)

	req, err := http.NewRequest("POST", "http://127.0.0.1:8332", bytes.NewBuffer(listWalletDirBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request for listwalletdir: %v", err)
	}
	req.SetBasicAuth("user", "password")
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to connect to Bitcoin Core: %v", err)
	}
	defer resp.Body.Close()

	respBody, _ := ioutil.ReadAll(resp.Body)

	var walletDirResponse RPCResponse
	if err := json.Unmarshal(respBody, &walletDirResponse); err != nil {
		return "", fmt.Errorf("failed to parse listwalletdir response: %v", err)
	}

	if walletDirResponse.Error != nil {
		return "", fmt.Errorf("error from listwalletdir: %v", walletDirResponse.Error)
	}

	wallets := walletDirResponse.Result.(map[string]interface{})["wallets"].([]interface{})

	// Step 2: Check if the address exists in any wallet
	for _, wallet := range wallets {
		walletName := wallet.(map[string]interface{})["name"].(string)

		// Load the wallet if it's not already loaded
		loadWalletReq := map[string]interface{}{
			"jsonrpc": "1.0",
			"id":      "curltext",
			"method":  "loadwallet",
			"params":  []interface{}{walletName},
		}
		loadWalletBody, _ := json.Marshal(loadWalletReq)

		req, err := http.NewRequest("POST", "http://127.0.0.1:8332", bytes.NewBuffer(loadWalletBody))
		if err != nil {
			return "", fmt.Errorf("failed to create request for loadwallet: %v", err)
		}
		req.SetBasicAuth("user", "password")
		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			return "", fmt.Errorf("failed to load wallet %s: %v", walletName, err)
		}
		defer resp.Body.Close()

		// Check address ownership
		getAddressInfoReq := map[string]interface{}{
			"jsonrpc": "1.0",
			"id":      "curltext",
			"method":  "getaddressinfo",
			"params":  []interface{}{address},
		}
		getAddressInfoBody, _ := json.Marshal(getAddressInfoReq)

		req, err = http.NewRequest("POST", "http://127.0.0.1:8332/wallet/"+walletName, bytes.NewBuffer(getAddressInfoBody))
		if err != nil {
			log.Printf("Failed to create request for wallet: %s, error: %v", walletName, err)
			continue
		}
		req.SetBasicAuth("user", "password")
		req.Header.Set("Content-Type", "application/json")

		resp, err = client.Do(req)
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

		if addressInfoResponse.Result != nil {
			result := addressInfoResponse.Result.(map[string]interface{})
			if isMine, ok := result["ismine"].(bool); ok && isMine {
				return walletName, nil
			}
		}

		// Unload the wallet if it was loaded
		unloadWalletReq := map[string]interface{}{
			"jsonrpc": "1.0",
			"id":      "curltext",
			"method":  "unloadwallet",
			"params":  []interface{}{walletName},
		}
		unloadWalletBody, _ := json.Marshal(unloadWalletReq)

		req, err = http.NewRequest("POST", "http://127.0.0.1:8332", bytes.NewBuffer(unloadWalletBody))
		if err != nil {
			log.Printf("Failed to create request to unload wallet %s: %v", walletName, err)
		} else {
			client.Do(req) // Ignore unload errors
		}
	}

	return "", fmt.Errorf("address not found in any wallet")
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

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if requestBody.WalletAddress == "" || requestBody.WalletPassword == "" {
		http.Error(w, "Wallet address and password are required", http.StatusBadRequest)
		return
	}

	WalletName, err := IdentifyWalletByAddress(requestBody.WalletAddress)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error identifying wallet: %v", err), http.StatusInternalServerError)
		return
	}

	// Attempt to unlock the wallet
	client := &http.Client{}
	rpcRequest := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "walletpassphrase",
		"params":  []interface{}{requestBody.WalletPassword, 60},
	}
	rpcRequestBody, _ := json.Marshal(rpcRequest)

	req, err := http.NewRequest("POST", "http://127.0.0.1:8332/wallet/"+WalletName, bytes.NewBuffer(rpcRequestBody))
	if err != nil {
		http.Error(w, "Failed to create HTTP request for unlocking wallet", http.StatusInternalServerError)
		return
	}
	req.SetBasicAuth("user", "password")
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to connect to Bitcoin Core for unlocking wallet", http.StatusInternalServerError)
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
	rpcRequestToUnlock := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "walletpassphrase",
		"params":  []interface{}{requestBody.WalletPassword, 6000}, // Unlock for 60 seconds
	}
	rpcRequestBodyToUnlock, _ := json.Marshal(rpcRequestToUnlock)
	req, err = http.NewRequest("POST", "http://127.0.0.1:8332/wallet/"+WalletName, bytes.NewBuffer(rpcRequestBodyToUnlock))
	if err != nil {
		http.Error(w, "Failed to create HTTP request for unlocking wallet", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"message": "Login successful!"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	// Set WALLET_ADDRESS and WALLET_NAME now
	WALLET_ADDRESS = requestBody.WalletAddress
	fmt.Println("Our WALLET_ADDRESS IS: ", WALLET_ADDRESS)
	WALLET_NAME = WalletName
	fmt.Println("Our WALLET_NAME IS: ", WALLET_NAME)

}

func SendToAddress(walletName, recipientAddress string, amount float64, comment string) (string, error) {
	client := &http.Client{}

	// Create the request body
	sendToAddressReq := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "sendtoaddress",
		"params":  []interface{}{recipientAddress, amount, comment},
	}
	sendToAddressBody, err := json.Marshal(sendToAddressReq)
	if err != nil {
		return "", fmt.Errorf("failed to create request body: %v", err)
	}

	// Make the request to the specific wallet's endpoint
	req, err := http.NewRequest("POST", "http://127.0.0.1:8332/wallet/"+walletName, bytes.NewBuffer(sendToAddressBody))
	if err != nil {
		return "", fmt.Errorf("failed to create HTTP request: %v", err)
	}
	req.SetBasicAuth("user", "password")
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to connect to Bitcoin Core: %v", err)
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %v", err)
	}

	var sendToAddressResponse RPCResponse
	if err := json.Unmarshal(respBody, &sendToAddressResponse); err != nil {
		return "", fmt.Errorf("failed to parse response: %v", err)
	}

	if sendToAddressResponse.Error != nil {
		return "", fmt.Errorf("error from sendtoaddress: %v", sendToAddressResponse.Error)
	}

	// Return the transaction ID
	txID, ok := sendToAddressResponse.Result.(string)
	if !ok {
		return "", fmt.Errorf("unexpected response format")
	}

	return txID, nil
}

func HandleSendToAddress(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var requestBody struct {
		WalletName       string  `json:"walletName"`
		RecipientAddress string  `json:"recipientAddress"`
		Amount           float64 `json:"amount"`
		Comment          string  `json:"comment"`
	}

	// Decode the request
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Send coins
	txID, err := SendToAddress(requestBody.WalletName, requestBody.RecipientAddress, requestBody.Amount, requestBody.Comment)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error sending coins: %v", err), http.StatusInternalServerError)
		return
	}

	// Respond with the transaction ID
	response := map[string]string{"transactionID": txID}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


