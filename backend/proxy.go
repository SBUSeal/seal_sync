package main

import (
	"io"
	"log"
	"net"
	"net/http"
)

// setting up proxy, tcp request
func handleTunneling(w http.ResponseWriter, r *http.Request) {
	log.Printf("CONNECT")
	destConn, err := net.Dial("tcp", r.Host)
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		log.Printf("Failed to connect to host %s: %v", r.Host, err)
		return
	}
	w.WriteHeader(http.StatusOK)
	hijacker, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "Hijacking not supported", http.StatusInternalServerError)
		return
	}
	clientConn, _, err := hijacker.Hijack()
	if err != nil {
		log.Printf("Hijacking failed: %v", err)
		return
	}

	go transfer(destConn, clientConn)
	go transfer(clientConn, destConn)
}

// http request
func handleHTTP(w http.ResponseWriter, req *http.Request) {
	log.Printf("HTTP REQ")

	transport := http.DefaultTransport

	outReq := new(http.Request)
	*outReq = *req // This creates a shallow copy of the request

	if req.URL.Scheme == "" {
		req.URL.Scheme = "http" // Assume http if not specified
		if req.TLS != nil {
			req.URL.Scheme = "https" // Use https if the incoming request was over TLS
		}
	}

	resp, err := transport.RoundTrip(outReq)
	if err != nil {
		http.Error(w, "Failed to reach the destination server.", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	copyHeader(w.Header(), resp.Header)
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func transfer(destination io.WriteCloser, source io.ReadCloser) {
	defer destination.Close()
	defer source.Close()
	io.Copy(destination, source)
}

// copy header values
func copyHeader(dst, src http.Header) {
	for k, vv := range src {
		for _, v := range vv {
			dst.Add(k, v)
		}
	}
}

// start up the proxy
func start_proxy() {
	proxy := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodConnect {
			handleTunneling(w, r)
		} else {
			handleHTTP(w, r)
		}
	})

	log.Println("Starting Proxy Server on port 8888...")
	log.Fatal(http.ListenAndServe(":8888", proxy))
}
