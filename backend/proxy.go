package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"time"

	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/protocol"
)

type Proxy struct {
	IP             string  `json:"ip"`
	Price          float64 `json:"price"`
	Port           float64 `json:"port"`
	DateAdded      string  `json:"dateAdded"`
	DateDisabled   string  `json:"dateDisabled,omitempty"`
	ConnectedUsers int     `json:"connectedUsers"`
	Profit         float64 `json:"profit"`
	DataUsed       float64 `json:"dataUsed"`
}

type ProxyProviderInfo struct {
	PeerID        string       `json:"peer_id"`
	Price         float64      `json:"price"`
	WalletAddress string       `json:"walletAddress"`
	Location      LocationInfo `json:"location"`
}

var proxy_provider_info_protocol = protocol.ID("/sealsync/proxyproviderinfo")

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

var proxy Proxy

// function for uploading to dht,
func enableProxy(ctx context.Context, dht *dht.IpfsDHT, w http.ResponseWriter, r *http.Request) {
	proxy_status = true

	// check if the method is valid
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// parse the form data
	err := r.ParseMultipartForm(50 << 20) // For example, 10 MB max memory
	if err != nil {
		http.Error(w, "Error parsing form data", http.StatusBadRequest)
		return
	}

	ip := r.FormValue("ip")
	priceStr := r.FormValue("price")
	portStr := r.FormValue("port")

	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		log.Printf("Error converting price to float64: %v", err)
		http.Error(w, "Invalid price format", http.StatusBadRequest)
		return
	}

	port, err := strconv.ParseFloat(portStr, 64)
	if err != nil {
		log.Printf("Error converting port to float64: %v", err)
		http.Error(w, "Invalid port format", http.StatusBadRequest)
		return
	}

	// Initialize the Proxy struct
	proxy.IP = ip
	proxy.Price = price
	proxy.Port = port
	proxy.Price = price
	proxy.DateAdded = time.Now().Format(time.RFC3339)
	proxy.ConnectedUsers = 0
	proxy.Profit = 0.0
	proxy.DataUsed = 0

	key := generateProxyKey("http_proxy_providers")
	// Start providing the key
	err = dht.Provide(ctx, key, true)
	if err != nil {
		log.Fatalf("failed to start providing key: %v", err)
	}
	fmt.Println("Successfully announced as provider for proxy:", key)

	jsonData, err := json.Marshal(proxy)
	if err != nil {
		log.Printf("Error marshaling proxy to JSON: %v", err)
		http.Error(w, "Error creating proxy response", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

// function for disabling
func disableProxy(ctx context.Context, w http.ResponseWriter, r *http.Request) {
	// check if the method is valid
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// set global var off meaning to not provide ip and port
	proxy_status = false

	// update aspects for the proxy struct
	proxy.DateDisabled = time.Now().Format(time.RFC3339)
	proxy.Profit = proxy.DataUsed * proxy.Price
	appendProxyHistory(proxy)
}

// make proxy history.json and and add
func appendProxyHistory(proxy Proxy) {
	file, err := ioutil.ReadFile("proxyHistories.json")
	if err != nil && !os.IsNotExist(err) {
		log.Fatalf("Error reading proxy histories file: %v", err)
		return
	}

	var proxies []Proxy
	if len(file) != 0 {
		err = json.Unmarshal(file, &proxies)
		if err != nil {
			log.Fatalf("Error unmarshaling proxy histories: %v", err)
			return
		}
	}

	proxies = append(proxies, proxy)

	jsonData, err := json.MarshalIndent(proxies, "", "    ")
	if err != nil {
		log.Fatalf("Error marshaling proxy histories: %v", err)
		return
	}

	err = ioutil.WriteFile("proxyHistoryMap.json", jsonData, 0644)
	if err != nil {
		log.Fatalf("Error writing to proxy histories file: %v", err)
	}
}

// function to handle the protocol, proxy_provider_info_protocol
func handleProxyProviderInfoRequests(node host.Host) {
	node.SetStreamHandler(proxy_provider_info_protocol, func(s network.Stream) {
		defer s.Close()

		var peer_id string
		if proxy_status {
			peer_id = node.ID().String()
		} else {
			peer_id = "UNAVAILABLE"
		}
		geoLocation := getGeolocation()

		// Suppose you parsed the data into a struct and now respond with the host info
		proxyInfo := ProxyProviderInfo{
			PeerID:        peer_id,
			Price:         proxy.Price,
			WalletAddress: WALLET_ADDRESS,
			Location:      geoLocation,
		}
		fmt.Println("XPROXY INFO FROM HOST:", proxyInfo)

		jsonData, err := json.Marshal(proxyInfo)
		if err != nil {
			log.Println("Error marshaling JSON:", err)
			return
		}
		// Write the provider info to the stream
		_, err = s.Write(jsonData)
		if err != nil {
			log.Println("Error writing to stream:", err)
			return
		}
	})
}

// function to get proxyprovider info from the peerID
func requestProxyProviderInfo(node host.Host, targetpeerid string) ProxyProviderInfo {

	fmt.Println("GETTING PROXY PROVIDER INFO")

	peerinfo := connectToPeerUsingRelay(node, targetpeerid)
	s, err := node.NewStream(network.WithAllowLimitedConn(globalCtx, "Provider info"), peerinfo.ID, proxy_provider_info_protocol)
	if err != nil {
		log.Fatalf("Failed to open stream to %s: %s", peerinfo.ID, err)
	}

	// buffer := make([]byte, 1024)
	// var data []byte
	// for {
	//     n, err := s.Read(buffer)
	//     if err != nil {
	//         if err != io.EOF {
	//             log.Fatal("ERROR")
	//         }
	//         break
	//     }
	//     // Append the data read to the slice
	//     data = append(data, buffer[:n]...)
	// }

	// fmt.Print(data)
	// Read the provider info
	decoder := json.NewDecoder(s)
	var info ProxyProviderInfo
	err = decoder.Decode(&info)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Recieved AT INFO REQUESTER:", info)
	return info
}
