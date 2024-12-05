package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
)

// Retrieve the public IP address using an external service
func getPublicIP() (string, error) {
	resp, err := http.Get("https://api.ipify.org?format=text")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	publicIP := string(body)
	// Print the public IP address to the console
	fmt.Println("Public IP Address:", publicIP)

	return string(body), nil
}

// Serve a file from the "shared_files" directory
func ServeFile(w http.ResponseWriter, r *http.Request) {
	filePath := r.URL.Query().Get("file")
	if filePath == "" {
		http.Error(w, "File path is required", http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join("./shared_files", filePath)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	http.ServeFile(w, r, fullPath)
}

// Generate a sharable link with public IP or domain
func GenerateFileLink(w http.ResponseWriter, r *http.Request) {
	filePath := r.URL.Query().Get("file")
	if filePath == "" {
		http.Error(w, "File path is required", http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join("./shared_files", filePath)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	// Get the public IP address
	publicIP, err := getPublicIP()
	if err != nil {
		http.Error(w, "Unable to determine public IP", http.StatusInternalServerError)
		return
	}

	// Replace `publicIP` with your domain if available
	shareableLink := fmt.Sprintf("http://%s:8080/ServeFile?file=%s", publicIP, filePath)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"link": shareableLink})
}
