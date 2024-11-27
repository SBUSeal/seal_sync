package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
)

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

	shareableLink := fmt.Sprintf("http://%s/shared_link?file=%s", r.Host, filePath)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"link": shareableLink})
}

func setupSharedDirectory() error {
	if _, err := os.Stat("./shared_files"); os.IsNotExist(err) {
		if err := os.Mkdir("./shared_files", os.ModePerm); err != nil {
			return fmt.Errorf("failed to create shared_files directory: %v", err)
		}
	}
	return nil
}
