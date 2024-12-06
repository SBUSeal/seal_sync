package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
)

func startTransferServer(privateIP string) {
	transferRouter := http.NewServeMux()

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

	fullPath := filepath.Join("./shared_files", filePath)
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

	fullPath := filepath.Join("./shared_files", filePath)
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

	// Replace `privateIP` with your domain if available
	shareableLink := fmt.Sprintf("http://%s:8080/shared_link?file=%s", privateIP, filePath)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"link": shareableLink})
}
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
