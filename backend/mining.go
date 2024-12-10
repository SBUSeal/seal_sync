package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"
	"time"
)

var (
	miningEnabled = true
	miningMutex   sync.Mutex
)

func HandleStartMining(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Retrieve session ID from headers
	sessionID := r.Header.Get("session_id")
	if sessionID == "" {
		http.Error(w, "Session ID is required", http.StatusUnauthorized)
		return
	}

	// Validate session and retrieve wallet address
	sessionMutex.Lock()
	session, exists := sessionStore[sessionID]
	sessionMutex.Unlock()
	if !exists || session.Expiry.Before(time.Now()) {
		http.Error(w, "Invalid or expired session", http.StatusUnauthorized)
		return
	}

	// Reset the miningEnabled flag
	miningMutex.Lock()
	if !miningEnabled {
		miningEnabled = true
	}
	miningMutex.Unlock()

	// Start mining in a separate goroutine to allow the server to handle other requests
	go func() {
		for {
			// Check mining flag with mutex lock
			miningMutex.Lock()
			if !miningEnabled {
				miningMutex.Unlock()
				fmt.Println("Mining stopped by user.")
				return
			}
			miningMutex.Unlock()

			// RPC request for generatetoaddress
			miningReq := map[string]interface{}{
				"jsonrpc": "1.0",
				"id":      "curltext",
				"method":  "generatetoaddress",
				"params":  []interface{}{1, session.WalletAddress},
			}
			miningReqBody, _ := json.Marshal(miningReq)

			client := &http.Client{}
			req, err := http.NewRequest("POST", "http://127.0.0.1:8332", bytes.NewBuffer(miningReqBody))
			if err != nil {
				fmt.Printf("Failed to create HTTP request for mining: %v\n", err)
				return
			}
			req.SetBasicAuth("user", "password") // Replace with your RPC credentials
			req.Header.Set("Content-Type", "application/json")

			resp, err := client.Do(req)
			if err != nil {
				fmt.Printf("Failed to connect to Bitcoin Core for mining: %v\n", err)
				return
			}
			defer resp.Body.Close()

			respBody, _ := ioutil.ReadAll(resp.Body)
			var miningResponse map[string]interface{}
			if err := json.Unmarshal(respBody, &miningResponse); err != nil {
				fmt.Printf("Failed to parse mining response: %v\n", err)
				return
			}

			if miningResponse["error"] != nil {
				fmt.Printf("Error mining blocks: %v\n", miningResponse["error"])
				return
			}

			fmt.Println("Successfully mined a block.")
			time.Sleep(1 * time.Second) // Add a delay to avoid overwhelming the RPC server
		}
	}()

	response := map[string]string{"message": "Continuous mining started. Use 'stopMining' to stop."}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


func HandleStopMining(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Retrieve session ID from headers
	sessionID := r.Header.Get("session_id")
	if sessionID == "" {
		http.Error(w, "Session ID is required", http.StatusUnauthorized)
		return
	}

	// Validate session
	sessionMutex.Lock()
	_, exists := sessionStore[sessionID]
	sessionMutex.Unlock()
	if !exists {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	// Stop mining
	miningMutex.Lock()
	miningEnabled = false
	miningMutex.Unlock()

	response := map[string]string{"message": "Continuous mining has been stopped!"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
