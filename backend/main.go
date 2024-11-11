package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	record "github.com/libp2p/go-libp2p-record"
	"github.com/libp2p/go-libp2p/core/crypto"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/peerstore"
	"github.com/libp2p/go-libp2p/p2p/protocol/circuitv2/client"
	"github.com/libp2p/go-libp2p/p2p/protocol/circuitv2/relay"
	"github.com/multiformats/go-multiaddr"
	"github.com/multiformats/go-multihash"
)

var (
	node_id             = "114418346" // give your SBU ID
	relay_node_addr     = "/ip4/130.245.173.221/tcp/4001/p2p/12D3KooWDpJ7As7BWAwRMfu1VU2WCqNjvq387JEYKDBj4kx6nXTN"
	bootstrap_node_addr = "/ip4/130.245.173.222/tcp/61000/p2p/12D3KooWQd1K1k8XA9xVEzSAu7HUCodC7LJB6uW5Kw4VwkRdstPE"
	globalCtx           context.Context
)

// Type for storing information about files
type FileInfo struct {
	FilePath string
	Price    float64
}

type LocationInfo struct {
	IP      string `json:"ip"`
	Country string `json:"country"`
	Region  string `json:"region"`
}

type FileProviderInfo struct {
	Peer_id  string       `json:"peer_id"`
	Price    string       `json:"price"`
	Location LocationInfo `json:"location"`
}

// Map from cid to FileInfo
var cidMap = make(map[string]FileInfo)

func generatePrivateKeyFromSeed(seed []byte) (crypto.PrivKey, error) {
	hash := sha256.Sum256(seed) // Generate deterministic key material
	// Create an Ed25519 private key from the hash
	privKey, _, err := crypto.GenerateEd25519Key(
		bytes.NewReader(hash[:]),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate private key: %w", err)
	}
	return privKey, nil
}

func createNode() (host.Host, *dht.IpfsDHT, error) {
	ctx := context.Background()
	seed := []byte(node_id)
	customAddr, err := multiaddr.NewMultiaddr("/ip4/0.0.0.0/tcp/0")
	if err != nil {
		return nil, nil, fmt.Errorf("failed to parse multiaddr: %w", err)
	}
	privKey, err := generatePrivateKeyFromSeed(seed)
	if err != nil {
		log.Fatal(err)
	}
	relayAddr, err := multiaddr.NewMultiaddr(relay_node_addr)
	if err != nil {
		log.Fatalf("Failed to create relay multiaddr: %v", err)
	}

	// Convert the relay multiaddress to AddrInfo
	relayInfo, err := peer.AddrInfoFromP2pAddr(relayAddr)
	if err != nil {
		log.Fatalf("Failed to create AddrInfo from relay multiaddr: %v", err)
	}

	node, err := libp2p.New(
		libp2p.ListenAddrs(customAddr),
		libp2p.Identity(privKey),
		libp2p.NATPortMap(),
		libp2p.EnableNATService(),
		libp2p.EnableAutoRelayWithStaticRelays([]peer.AddrInfo{*relayInfo}),
		libp2p.EnableRelayService(),
		libp2p.EnableHolePunching(),
	)

	if err != nil {
		return nil, nil, err
	}
	_, err = relay.New(node)
	if err != nil {
		log.Printf("Failed to instantiate the relay: %v", err)
	}

	dhtRouting, err := dht.New(ctx, node, dht.Mode(dht.ModeClient))
	if err != nil {
		return nil, nil, err
	}
	namespacedValidator := record.NamespacedValidator{
		"orcanet": &CustomValidator{}, // Add a custom validator for the "orcanet" namespace
	}

	dhtRouting.Validator = namespacedValidator // Configure the DHT to use the custom validator

	err = dhtRouting.Bootstrap(ctx)
	if err != nil {
		return nil, nil, err
	}
	fmt.Println("DHT bootstrap complete.")

	// Set up notifications for new connections
	node.Network().Notify(&network.NotifyBundle{
		ConnectedF: func(n network.Network, conn network.Conn) {
			fmt.Printf("Notification: New peer connected %s\n", conn.RemotePeer().String())
		},
	})

	return node, dhtRouting, nil
}

func connectToPeer(node host.Host, peerAddr string) {
	addr, err := multiaddr.NewMultiaddr(peerAddr)
	if err != nil {
		log.Printf("Failed to parse peer address: %s", err)
		return
	}

	info, err := peer.AddrInfoFromP2pAddr(addr)
	if err != nil {
		log.Printf("Failed to get AddrInfo from address: %s", err)
		return
	}

	node.Peerstore().AddAddrs(info.ID, info.Addrs, peerstore.PermanentAddrTTL)
	err = node.Connect(context.Background(), *info)
	if err != nil {
		log.Printf("Failed to connect to peer: %s", err)
		return
	}

	fmt.Println("Connected to:", info.ID)
}

func connectToPeerUsingRelay(node host.Host, targetPeerID string) *peer.AddrInfo {
	ctx := globalCtx
	targetPeerID = strings.TrimSpace(targetPeerID)
	relayAddr, err := multiaddr.NewMultiaddr(relay_node_addr)
	if err != nil {
		log.Printf("Failed to create relay multiaddr: %v", err)
	}
	peerMultiaddr := relayAddr.Encapsulate(multiaddr.StringCast("/p2p-circuit/p2p/" + targetPeerID))
	relayedAddrInfo, err := peer.AddrInfoFromP2pAddr(peerMultiaddr)
	if err != nil {
		log.Println("Failed to get relayed AddrInfo: %w", err)
	}
	// Connect to the peer through the relay
	err = node.Connect(ctx, *relayedAddrInfo)
	if err != nil {
		log.Println("Failed to connect to peer through relay: %w", err)
	}

	fmt.Printf("Connected to peer via relay: %s\n", targetPeerID)
	return relayedAddrInfo
}

func receiveDataFromPeer(node host.Host) {
	// Set a stream handler to listen for incoming streams on the "/senddata/p2p" protocol
	node.SetStreamHandler("/senddata/p2p", func(s network.Stream) {
		defer s.Close()
		// Create a buffered reader to read data from the stream
		buf := bufio.NewReader(s)
		// Read data from the stream
		data, err := buf.ReadBytes('\n') // Reads until a newline character
		if err != nil {
			if err == io.EOF {
				log.Printf("Stream closed by peer: %s", s.Conn().RemotePeer())
			} else {
				log.Printf("Error reading from stream: %v", err)
			}
			return
		}
		// Print the received data
		log.Printf("Received data: %s", data)
	})
}

func sendDataToPeer(node host.Host, targetpeerid string) {
	var ctx = context.Background()
	targetPeerID := strings.TrimSpace(targetpeerid)
	relayAddr, err := multiaddr.NewMultiaddr(relay_node_addr)
	if err != nil {
		log.Printf("Failed to create relay multiaddr: %v", err)
	}
	peerMultiaddr := relayAddr.Encapsulate(multiaddr.StringCast("/p2p-circuit/p2p/" + targetPeerID))

	peerinfo, err := peer.AddrInfoFromP2pAddr(peerMultiaddr)
	if err != nil {
		log.Fatalf("Failed to parse peer address: %s", err)
	}
	if err := node.Connect(ctx, *peerinfo); err != nil {
		log.Printf("Failed to connect to peer %s via relay: %v", peerinfo.ID, err)
		return
	}
	s, err := node.NewStream(network.WithAllowLimitedConn(ctx, "/senddata/p2p"), peerinfo.ID, "/senddata/p2p")
	if err != nil {
		log.Printf("Failed to open stream to %s: %s", peerinfo.ID, err)
		return
	}
	defer s.Close()
	_, err = s.Write([]byte("sending hello to peer\n"))
	if err != nil {
		log.Fatalf("Failed to write to stream: %s", err)
	}

}

func handleProviderInfoRequests(node host.Host) {
	node.SetStreamHandler("/sealsync/providerinfo", func(s network.Stream) {
		defer s.Close()
		// Create a buffered reader to read data from the stream
		buf := bufio.NewReader(s)
		// Read data from the stream
		cid, err := buf.ReadString('\n') // Reads until a newline character
		if err != nil {
			if err == io.EOF {
				log.Printf("Stream closed by peer: %s", s.Conn().RemotePeer())
			} else {
				log.Printf("Error reading from stream: %v", err)
			}
			return
		}
		log.Printf("Requested CID: %s", cid)
		cid = strings.TrimSuffix(cid, "\n")
		// Create FileProviderInfo to be sent back
		price := strconv.FormatFloat(cidMap[cid].Price, 'f', -1, 64)
		geoLocation := getGeolocation()
		providerInfo := FileProviderInfo{
			Peer_id:  node.ID().String(),
			Price:    price,
			Location: geoLocation,
		}

		// Write to the stream
		jsonData, err := json.Marshal(providerInfo)
		if err != nil {
			log.Fatal(err)
		}
		_, err = s.Write(append(jsonData, '\n'))
		if err != nil {
			log.Fatal(err)
		}

	})
}

//Connects to peer through relay, sends cid then waits for response containing the price

func requestProviderInfo(node host.Host, targetpeerid string, cid cid.Cid) FileProviderInfo {

	peerinfo := connectToPeerUsingRelay(node, targetpeerid)
	s, err := node.NewStream(network.WithAllowLimitedConn(globalCtx, "/sealsync/providerinfo"), peerinfo.ID, "/sealsync/providerinfo")
	if err != nil {
		log.Printf("Failed to open stream to %s: %s", peerinfo.ID, err)
	}
	defer s.Close()
	_, err = s.Write([]byte(cid.String() + "\n"))
	if err != nil {
		log.Fatalf("Failed to write to stream: %s", err)
	}
	// Read the price from the peer
	var info FileProviderInfo
	reader := bufio.NewReader(s)
	providerInfoData, err := reader.ReadString('\n')
	if err != nil {
		log.Fatalf("Failed to read provider info: %s", err)
	}
	err = json.Unmarshal([]byte(providerInfoData), &info)
	if err != nil {
		log.Fatalf("Failed to unmarshal file provider info: %s", err)
	}
	return info
}

func handleFileRequests(node host.Host) {
	node.SetStreamHandler("/sealsync/file-transfer", func(s network.Stream) {
		defer s.Close()
		buf := bufio.NewReader(s)
		// Read cid from the stream
		cid, err := buf.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				log.Printf("Stream closed by peer: %s", s.Conn().RemotePeer())
			} else {
				log.Printf("Error reading from stream: %v", err)
			}
			return
		}
		log.Printf("File Transfer Cid Received: %s, now sending file...", cid)
		//Send file name (with extension) first
		cid = strings.TrimSuffix(cid, "\n")
		fileInfo, exists := cidMap[cid]
		if !exists {
			fmt.Println("File didnt exist in map error")
			return
		}
		s.Write([]byte(filepath.Base(fileInfo.FilePath + "\n")))

		//Open the file
		file, err := os.Open(fileInfo.FilePath)
		if err != nil {
			fmt.Println("Failure to open the file")
		}

		bytes, err := io.Copy(s, file)
		if err != nil {
			fmt.Println("Failure to copy the file to the stream")
		}

		fmt.Fprintln(os.Stdout, "Successfully sent file, %d bytes were sent", bytes)

	})
}

// Connect to peer through relay, (get price), send cid then wait for response containing the file
func requestFile(node host.Host, targetpeerid string, cid string) {
	peerinfo := connectToPeerUsingRelay(node, targetpeerid)
	s, err := node.NewStream(network.WithAllowLimitedConn(globalCtx, "/sealsync/file-transfer"), peerinfo.ID, "/sealsync/file-transfer")
	if err != nil {
		log.Printf("Failed to open stream to %s: %s", peer.ID(targetpeerid), err)
	}
	defer s.Close()
	//Write the cid
	_, err = s.Write([]byte(cid + "\n"))
	if err != nil {
		log.Fatalf("Failed to write to stream: %s", err)
	}
	reader := bufio.NewReader(s)

	//Read filename
	filename, err := reader.ReadString('\n')
	if err != nil {
		fmt.Println("Error reading the file name")
	}
	filename = strings.TrimSuffix(filename, "\n")
	fmt.Println("Received Filename: ", filename)

	// Create the downloads directory if it doesn't exist
	err = os.MkdirAll("downloads", os.ModePerm)
	if err != nil {
		fmt.Errorf("failed to create directory: %v", err)
	}
	//Create new file
	newFile, err := os.Create(filepath.Join("downloads", filename))
	if err != nil {
		fmt.Println("Error creating the file: ", err)
	}
	//Copy file contents to the new file
	bytes, err := io.Copy(s, newFile)
	if err != nil {
		fmt.Println("Error copying from stream to new file: ", err)
	}
	fmt.Fprintln(os.Stdout, "Successfully copied %d bytes from the stream", bytes)

}

func handlePeerExchange(node host.Host) {
	relayInfo, _ := peer.AddrInfoFromString(relay_node_addr)
	node.SetStreamHandler("/orcanet/p2p", func(s network.Stream) {
		defer s.Close()

		buf := bufio.NewReader(s)
		peerAddr, err := buf.ReadString('\n')
		if err != nil {
			if err != io.EOF {
				fmt.Printf("error reading from stream: %v", err)
			}
		}
		peerAddr = strings.TrimSpace(peerAddr)
		var data map[string]interface{}
		err = json.Unmarshal([]byte(peerAddr), &data)
		if err != nil {
			fmt.Printf("error unmarshaling JSON: %v", err)
		}
		if knownPeers, ok := data["known_peers"].([]interface{}); ok {
			for _, peer := range knownPeers {
				fmt.Println("Peer:")
				if peerMap, ok := peer.(map[string]interface{}); ok {
					if peerID, ok := peerMap["peer_id"].(string); ok {
						if string(peerID) != string(relayInfo.ID) {
							connectToPeerUsingRelay(node, peerID)
						}
					}
				}
			}
		}
	})
}

func main() {
	node, dht, err := createNode()
	if err != nil {
		log.Fatalf("Failed to create node: %s", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	globalCtx = ctx

	fmt.Println("Node multiaddresses:", node.Addrs())
	fmt.Println("Node Peer ID:", node.ID())

	connectToPeer(node, relay_node_addr) // connect to relay node
	makeReservation(node)                // make reservation on realy node
	go refreshReservation(node, 10*time.Minute)
	connectToPeer(node, bootstrap_node_addr) // connect to bootstrap node
	// go handlePeerExchange(node)

	// go handleInput(ctx, dht)

	// Start the http server to communicate between frontend and backend
	go startHttpServer(ctx, dht, node)

	// Start the http server that listens for connections from other users
	// It will send the corresponding file as a response
	go startTransferServer()

	// receiveDataFromPeer(node)
	// sendDataToPeer(node, "12D3KooWKNWVMpDh5ZWpFf6757SngZfyobsTXA8WzAWqmAjgcdE6")

	handleProviderInfoRequests(node)
	handleFileRequests(node)
	defer node.Close()

	select {}
}

func handleInput(ctx context.Context, dht *dht.IpfsDHT) {
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("User Input \n ")
	for {
		fmt.Print("> ")
		input, _ := reader.ReadString('\n') // Read input from keyboard
		input = strings.TrimSpace(input)    // Trim any trailing newline or spaces
		args := strings.Split(input, " ")
		if len(args) < 1 {
			fmt.Println("No command provided")
			continue
		}
		command := args[0]
		command = strings.ToUpper(command)
		switch command {
		case "GET":
			if len(args) < 2 {
				fmt.Println("Expected key")
				continue
			}
			key := args[1]
			dhtKey := "/orcanet/" + key
			res, err := dht.GetValue(ctx, dhtKey)
			if err != nil {
				fmt.Printf("Failed to get record: %v\n", err)
				continue
			}
			fmt.Printf("Record: %s\n", res)

		case "GET_PROVIDERS":
			if len(args) < 2 {
				fmt.Println("Expected key")
				continue
			}
			key := args[1]
			data := []byte(key)
			hash := sha256.Sum256(data)
			mh, err := multihash.EncodeName(hash[:], "sha2-256")
			if err != nil {
				fmt.Printf("Error encoding multihash: %v\n", err)
				continue
			}
			c := cid.NewCidV1(cid.Raw, mh)
			providers := dht.FindProvidersAsync(ctx, c, 20)

			fmt.Println("Searching for providers...")
			for p := range providers {
				if p.ID == peer.ID("") {
					break
				}
				fmt.Printf("Found provider: %s\n", p.ID.String())
				for _, addr := range p.Addrs {
					fmt.Printf(" - Address: %s\n", addr.String())
				}
			}

		case "PUT":
			if len(args) < 3 {
				fmt.Println("Expected key and value")
				continue
			}
			key := args[1]
			value := args[2]
			dhtKey := "/orcanet/" + key
			log.Println(dhtKey)
			err := dht.PutValue(ctx, dhtKey, []byte(value))
			if err != nil {
				fmt.Printf("Failed to put record: %v\n", err)
				continue
			}
			// provideKey(ctx, dht, key)
			fmt.Println("Record stored successfully")

		case "PUT_PROVIDER":
			if len(args) < 2 {
				fmt.Println("Expected key")
				continue
			}
			key := args[1]
			provideKey(ctx, dht, key)
		default:
			fmt.Println("Expected GET, GET_PROVIDERS, PUT or PUT_PROVIDER")
		}
	}
}

func provideKey(ctx context.Context, dht *dht.IpfsDHT, key string) error {
	data := []byte(key)
	hash := sha256.Sum256(data)
	mh, err := multihash.EncodeName(hash[:], "sha2-256")
	if err != nil {
		return fmt.Errorf("error encoding multihash: %v", err)
	}
	c := cid.NewCidV1(cid.Raw, mh)

	// Start providing the key
	err = dht.Provide(ctx, c, true)
	if err != nil {
		return fmt.Errorf("failed to start providing key: %v", err)
	}
	return nil
}

func makeReservation(node host.Host) {
	ctx := globalCtx
	relayInfo, err := peer.AddrInfoFromString(relay_node_addr)
	if err != nil {
		log.Fatalf("Failed to create addrInfo from string representation of relay multiaddr: %v", err)
	}
	_, err = client.Reserve(ctx, node, *relayInfo)
	if err != nil {
		log.Fatalf("Failed to make reservation on relay: %v", err)
	}
	fmt.Printf("Reservation successfull \n")
}

func refreshReservation(node host.Host, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			makeReservation(node)
		case <-globalCtx.Done():
			fmt.Println("Context done, stopping reservation refresh.")
			return
		}
	}
}

func getGeolocation() LocationInfo {
	// Get the public IP address
	resp, err := http.Get("https://api.ipify.org?format=text")
	if err != nil {
		fmt.Println("Error getting public IP:", err)
		log.Fatal(err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		log.Fatal(err)
	}
	publicIP := string(body)
	fmt.Println("Found Node Public IP:", publicIP)

	// Get location info from public IP
	geoResp, err := http.Get(fmt.Sprintf("https://ipinfo.io/%s/json", publicIP))
	if err != nil {
		fmt.Println("Error getting location:", err)
		log.Fatal(err)
	}
	defer geoResp.Body.Close()

	geoBody, err := io.ReadAll(geoResp.Body)
	if err != nil {
		fmt.Println("Error reading location response:", err)
		log.Fatal(err)
	}

	var location LocationInfo
	if err := json.Unmarshal(geoBody, &location); err != nil {
		fmt.Println("Error parsing location JSON:", err)
		log.Fatal(err)
	}
	return location
}
