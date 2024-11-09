package main

import (
	"fmt"
	"log"
	"mime"
	"net"
	"net/http"
	"path/filepath"
	"strings"
)

func sendFile(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	// must be a GET request
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	cid := r.PathValue("cid")
	fileInfo, exists := cidMap[cid]
	if !exists {
		http.Error(w, "File is not found", http.StatusNotFound)
		return
	}
	extension := filepath.Ext(fileInfo.FilePath)
	mimeType := mime.TypeByExtension(extension)
	// Set the correct headers to make it downloadable
	w.Header().Set("Content-Disposition", "attachment; filename="+filepath.Base(fileInfo.FilePath))
	w.Header().Set("Content-Type", mimeType)

	// Serve the file
	http.ServeFile(w, r, fileInfo.FilePath)

}

func sendFilePrice(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	// must be a GET request
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	cid := r.PathValue("cid")
	fileInfo, exists := cidMap[cid]
	if !exists {
		http.Error(w, "File is not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "text/plain")

	// Write plain text directly to response
	fmt.Fprintln(w, fileInfo.Price)

}

func startTransferServer() {
	transfer_router := http.NewServeMux()

	transfer_router.HandleFunc("/file/{cid}", sendFile)
	transfer_router.HandleFunc("/price/{cid}", sendFilePrice)

	privateIP, err := getPrivateIP()
	if err != nil {
		fmt.Println("Error finding private IP for transfer server: ", err)
		log.Fatal(err)
	}
	fmt.Println("Transfer server is running on IP: ", privateIP, " Port: 8081")
	err = http.ListenAndServe(privateIP+":8081", transfer_router)
	if err != nil {
		fmt.Println("we got error!: ", err)
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
			if isPrivateIP(ip.String()) {
				return ip.String(), nil
			}
		}
	}
	return "", fmt.Errorf("no private IP address found")
}

func isPrivateIP(ip string) bool {
	return strings.HasPrefix(ip, "10.") ||
		strings.HasPrefix(ip, "172.") ||
		strings.HasPrefix(ip, "192.168.")
}
