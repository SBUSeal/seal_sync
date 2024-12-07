package main

import (
	"fmt"
	"io"
	"log"
	"net/http"

	// "path"
	"strings"
)

// With out configuring proxy: localhost:8888/webserver/page
// Configuring proxy:  on network settings, set proxy server's IP address and port in the device's network settings
// no need to add localhost:8888

// Making a functional proxy page.
// Enable being a proxy and show available ones
// Connecting to someone as a proxy

// Create a custom transport that can be used to send the request
var customTransport = &http.Transport{
	// Proxy: http.ProxyFromEnvironment, // This uses the standard proxy settings defined in environment variables, remove if not using a proxy.
}

// proxy request handler, should route request to destination server
func handleRequest(w http.ResponseWriter, r *http.Request) {
	targetURL := r.URL.String()
	// skip http:// or https://
	http_index := strings.Index(targetURL, "://")
	if http_index != -1 {
		targetURL = targetURL[(http_index + 3):]
	}
	slash_index := strings.Index(targetURL, "/")
	// skip initial /
	if slash_index == 0 {
		targetURL = targetURL[1:]
	}

	page := ""
	port := ""
	webserver := ""
	// If there is another '/', then there is a path to specific page
	page_index := strings.Index(targetURL, "/")
	if page_index == -1 {
		page = "/"
		webserver = targetURL
	} else {
		page = targetURL[page_index:]
		targetURL = targetURL[:page_index] // Adjust targetURL to exclude the page path
	}

	// Find port if it is specified, else default to 80
	port_index := strings.Index(targetURL, ":")
	if port_index == -1 {
		port = ":80"
		webserver = targetURL
	} else {
		port = targetURL[port_index:]
		webserver = targetURL[:port_index]
	}

	fullURL := "http://" + webserver + port + page
	fmt.Println("GIVEN URL:", r.URL.String())
	fmt.Println("FULL URL:", fullURL)

	proxyReq, err := http.NewRequest(r.Method, fullURL, r.Body)
	if err != nil {
		fmt.Println("Failed to create request:", err)
		http.Error(w, "Error creating proxy request", http.StatusInternalServerError)
		return
	}

	// Copy the headers from the original request to the proxy request
	for name, values := range r.Header {
		for _, value := range values {
			proxyReq.Header.Add(name, value)
		}
	}

	// Send the proxy request using the custom transport
	resp, err := customTransport.RoundTrip(proxyReq)
	if err != nil {
		fmt.Printf("Error during RoundTrip: %v\n", err)
		http.Error(w, "Error sending proxy request", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Copy the headers from the proxy response to the original response
	for name, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(name, value)
		}
	}

	// Set the status code of the original response to the status code of the proxy response
	w.WriteHeader(resp.StatusCode)

	// Copy the body of the proxy response to the original response
	io.Copy(w, resp.Body)
}

// Starting the proxy
func start_proxy() {
	proxy_port := ":8888" // specifying the port the proxy server will listen to

	// create new http server with handler as handleRequest function
	server := &http.Server{
		Addr:    proxy_port,
		Handler: http.HandlerFunc(handleRequest),
	}

	// Start server and log errors
	fmt.Println("Starting Proxy Server On", proxy_port)
	err := server.ListenAndServe()
	if err != nil {
		log.Fatal("Error starting proxy server: ", err)
	}
}
