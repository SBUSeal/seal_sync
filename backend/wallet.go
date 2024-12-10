package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

type BalanceResponse struct {
	Balance float64 `json:"balance"`
}

func HandleGetBalance(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Validate session and get the wallet address
	walletAddress, err := ValidateSession(r)
	if err != nil {
		http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
		return
	}

	// Identify the wallet name using the wallet address
	walletName, err := IdentifyWalletByAddress(walletAddress)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error identifying wallet: %v", err), http.StatusInternalServerError)
		return
	}

	client := &http.Client{}
	getBalanceReq := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "getbalance",
		"params":  []interface{}{},
	}
	reqBody, err := json.Marshal(getBalanceReq)
	if err != nil {
		http.Error(w, "Failed to create RPC request", http.StatusInternalServerError)
		return
	}

	// Make RPC request to Bitcoin Core
	req, err := http.NewRequest("POST", fmt.Sprintf("http://127.0.0.1:8332/wallet/%s", walletName), bytes.NewBuffer(reqBody))
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

	var rpcResponse map[string]interface{}
	if err := json.Unmarshal(respBody, &rpcResponse); err != nil {
		http.Error(w, "Failed to parse response from Bitcoin Core", http.StatusInternalServerError)
		return
	}

	if rpcResponse["error"] != nil {
		http.Error(w, fmt.Sprintf("Error from Bitcoin Core: %v", rpcResponse["error"]), http.StatusInternalServerError)
		return
	}

	// Extract and send balance
	balance, ok := rpcResponse["result"].(float64)
	if !ok {
		http.Error(w, "Invalid response from Bitcoin Core", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(BalanceResponse{Balance: balance})
}
