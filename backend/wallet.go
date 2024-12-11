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

type Transaction struct {
	TxID          string  `json:"txid"`
	Category      string  `json:"category"`
	Amount        float64 `json:"amount"`
	Time          int64   `json:"time"`
	Address       string  `json:"address"`
    Description   string  `json:"comment"`
}


func HandleGetBalance(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	if WALLET_ADDRESS == "" {
		http.Error(w, "Wallet address is not set", http.StatusBadRequest)
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
	req, err := http.NewRequest("POST", fmt.Sprintf("http://127.0.0.1:8332/wallet/%s", WALLET_NAME), bytes.NewBuffer(reqBody))
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

func HandleGetTransactions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	if WALLET_ADDRESS == "" {
		http.Error(w, "Wallet address is not set", http.StatusBadRequest)
		return
	}

	client := &http.Client{}
	getTransactionsReq := map[string]interface{}{
		"jsonrpc": "1.0",
		"id":      "curltext",
		"method":  "listtransactions",
		"params":  []interface{}{"*", 9999999, 0}, 
	}
	reqBody, err := json.Marshal(getTransactionsReq)
	if err != nil {
		http.Error(w, "Failed to create RPC request", http.StatusInternalServerError)
		return
	}

	// Make RPC request to Bitcoin Core
	req, err := http.NewRequest("POST", fmt.Sprintf("http://127.0.0.1:8332/wallet/%s", WALLET_NAME), bytes.NewBuffer(reqBody))
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

	// Extract transactions from the result
	transactions, ok := rpcResponse["result"].([]interface{})
	if !ok {
		http.Error(w, "Invalid response from Bitcoin Core", http.StatusInternalServerError)
		return
	}

	// Format the transactions into a readable structure
	var formattedTransactions []Transaction
	for _, tx := range transactions {
		txMap, ok := tx.(map[string]interface{})
		if !ok {
			continue
		}

		var description string
			if comment, ok := txMap["comment"].(string); ok {
				description = comment
			} else {description = "No description added"}
			

		formattedTransactions = append(formattedTransactions, Transaction{
			TxID:          txMap["txid"].(string),
			Category:      txMap["category"].(string),
			Amount:        txMap["amount"].(float64),
			Time:          int64(txMap["time"].(float64)),
			Address:       txMap["address"].(string),
			Description:    description,

		})
	}

	var cleanedTransactions []Transaction =aggregateGenerateTransactions( formattedTransactions)
	for i, j := 0, len(cleanedTransactions)-1; i < j; i, j = i+1, j-1 {
		cleanedTransactions[i], cleanedTransactions[j] = cleanedTransactions[j], cleanedTransactions[i]
	}

	// Respond with the formatted transactions
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cleanedTransactions)
}


func aggregateGenerateTransactions(transactions []Transaction) []Transaction {
    if len(transactions) == 0 {
        return transactions
    }

    var aggregated []Transaction
    var currentAggregate *Transaction

    for _, tx := range transactions {
        if tx.Category == "generate" {
            if currentAggregate == nil {
                // Start a new aggregate
                currentAggregate = &Transaction{
                    Category: "generate",
                    Amount:   tx.Amount,
                    Time:     tx.Time,
                    TxID:     tx.TxID,
					Description:  "Seal Tokens Mined",
                }
            } else {
                // Aggregate with the current transaction
                currentAggregate.Amount += tx.Amount
                currentAggregate.Time = tx.Time // Update to the latest time
                currentAggregate.TxID = tx.TxID // Update to the latest TxID
            }
        } else {
            // If it's not "generate", push the current aggregate and reset
            if currentAggregate != nil {
                aggregated = append(aggregated, *currentAggregate)
                currentAggregate = nil
            }
            aggregated = append(aggregated, tx) // Add non-generate transaction directly
        }
    }

    // Add any remaining aggregate at the end
    if currentAggregate != nil {
        aggregated = append(aggregated, *currentAggregate)
    }

    return aggregated
}
