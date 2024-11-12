package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

// BitcoinRPCConfig holds the configuration details for RPC
type BitcoinRPCConfig struct {
	User     string
	Password string
	Host     string
	Port     string
}

// RPCRequest is the format for sending RPC requests
type RPCRequest struct {
	JSONRPC string        `json:"jsonrpc"`
	Method  string        `json:"method"`
	Params  []interface{} `json:"params"`
	ID      int           `json:"id"`
}

// RPCResponse is the format for receiving RPC responses
type RPCResponse struct {
	Result interface{} `json:"result"`
	Error  interface{} `json:"error"`
	ID     int         `json:"id"`
}

// User represents a user with a username and password
type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// In-memory store for user credentials (for demonstration purposes)
var users = map[string]string{
	"alice": "password123", // Example user
	"bob":   "mysecurepass",
}

// NewBitcoinRPCClient initializes a new Bitcoin RPC client
func NewBitcoinRPCClient(config BitcoinRPCConfig) *BitcoinRPCConfig {
	return &config
}

// CallRPC sends an RPC request to the Bitcoin node
func (config *BitcoinRPCConfig) CallRPC(method string, params []interface{}) (interface{}, error) {
	rpcRequest := RPCRequest{
		JSONRPC: "1.0",
		Method:  method,
		Params:  params,
		ID:      1,
	}

	rpcRequestBody, err := json.Marshal(rpcRequest)
	if err != nil {
		return nil, err
	}

	request, err := http.NewRequest("POST", fmt.Sprintf("http://%s:%s", config.Host, config.Port), bytes.NewBuffer(rpcRequestBody))
	if err != nil {
		return nil, err
	}

	request.SetBasicAuth(config.User, config.Password)
	request.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	var rpcResponse RPCResponse
	if err := json.Unmarshal(body, &rpcResponse); err != nil {
		return nil, err
	}

	if rpcResponse.Error != nil {
		return nil, fmt.Errorf("RPC Error: %v", rpcResponse.Error)
	}

	return rpcResponse.Result, nil
}

// AuthenticateUser checks if the provided username and password are correct
func AuthenticateUser(username, password string) bool {
	storedPassword, exists := users[username]
	return exists && storedPassword == password
}

// HandleLogin handles login requests from the frontend
func HandleLogin(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if AuthenticateUser(user.Username, user.Password) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Login successful")
	} else {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
	}
}

// HandleCreateWallet handles wallet creation requests from the frontend
func HandleCreateWallet(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if !AuthenticateUser(user.Username, user.Password) {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	// Initialize the RPC client
	config := BitcoinRPCConfig{
		User:     "user",       // Replace with your rpcuser
		Password: "password",   // Replace with your rpcpassword
		Host:     "127.0.0.1",  // Bitcoin core host
		Port:     "8332",       // Bitcoin core RPC port
	}

	client := NewBitcoinRPCClient(config)
	walletName := user.Username + "_wallet"

	// Create wallet RPC call
	result, err := client.CallRPC("createwallet", []interface{}{walletName})
	if err != nil {
		http.Error(w, "Error creating wallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond with wallet creation result
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Wallet created successfully",
		"walletName": walletName,
		"result":     result,
	})
}

func main() {
	http.HandleFunc("/login", HandleLogin)
	http.HandleFunc("/createWallet", HandleCreateWallet)

	fmt.Println("Server is running on port 8080")
	http.ListenAndServe(":8080", nil)
}
