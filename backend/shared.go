package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/url" // Added for URL encoding
	"os"
	"path/filepath"
)

func startTransferServer(privateIP string) {
	transferRouter := http.NewServeMux()
	transferRouter.HandleFunc("/shared_link", ServeFile)
	transferRouter.HandleFunc("/generate_link", GenerateFileLink)

	fmt.Println("Transfer server is running on IP: ", privateIP, " Port: 8081")
	err := http.ListenAndServe(privateIP+":8081", transferRouter)
	if err != nil {
		fmt.Println("Error: ", err)
		log.Fatal("ListenAndServe: ", err)
	}
}

func getPrivateIP() (string, error) {
	interfaces, err := net.Interfaces()
	if err != nil {
		return "", err
	}
	for _, iface := range interfaces {
		// Skip interfaces that are down
		if iface.Flags&net.FlagUp == 0 {
			continue
		}
		// Skip loopback interfaces (localhost)
		if iface.Flags&net.FlagLoopback != 0 {
			continue
		}
		addrs, err := iface.Addrs()
		if err != nil {
			return "", err
		}
		// Iterate over the addresses of this interface
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			// Check if the IP is a private address
			if ip == nil || ip.IsLoopback() {
				continue
			}
			// We only want IPv4 addresses
			ip = ip.To4()
			if ip == nil {
				continue
			}
			// Return the first private IP address we find
			if isPrivateIP(ip) {
				return ip.String(), nil
			}
		}
	}
	return "", fmt.Errorf("no private IP address found")
}

func isPrivateIP(ip net.IP) bool {
	privateBlocks := []string{
		"10.0.0.0/8",     // Class A private range
		"172.16.0.0/12",  // Class B private range
		"192.168.0.0/16", // Class C private range
	}

	for _, block := range privateBlocks {
		_, subnet, _ := net.ParseCIDR(block)
		if subnet.Contains(ip) {
			return true
		}
	}
	return false
}

func ServeFile(w http.ResponseWriter, r *http.Request) {
	filePath := r.URL.Query().Get("file")
	if filePath == "" {
		http.Error(w, "File path is required", http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join("./uploads", filePath)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	http.ServeFile(w, r, fullPath)
}

// Generate a sharable link with private IP or domain
func GenerateFileLink(w http.ResponseWriter, r *http.Request) {
	filePath := r.URL.Query().Get("file")
	if filePath == "" {
		http.Error(w, "File path is required", http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join("./uploads", filePath)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	// Get the private IP address
	privateIP, err := getPrivateIP()
	if err != nil {
		http.Error(w, "Unable to determine private IP", http.StatusInternalServerError)
		return
	}

	// URL-encode the file path to handle spaces and special characters
	encodedFilePath := url.QueryEscape(filePath)

	// Replace `privateIP` with your domain if available
	shareableLink := fmt.Sprintf("http://%s:8081/shared_link?file=%s", privateIP, encodedFilePath)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"link": shareableLink})
}
