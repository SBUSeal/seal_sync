package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

func HandleStartMining(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	if WALLET_ADDRESS == "" {
		http.Error(w, "Wallet address is not set", http.StatusBadRequest)
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
				"params":  []interface{}{1, WALLET_ADDRESS},
			}
			miningReqBody, _ := json.Marshal(miningReq)

			client := &http.Client{}
			req, err := http.NewRequest("POST", "http://127.0.0.1:8332", bytes.NewBuffer(miningReqBody))
			if err != nil {
				fmt.Printf("Failed to create HTTP request for mining: %v\n", err)
				return
			}
			req.SetBasicAuth("user", "password")
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

	// Stop mining
	miningMutex.Lock()
	miningEnabled = false
	miningMutex.Unlock()

	response := map[string]string{"message": "Continuous mining has been stopped!"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
