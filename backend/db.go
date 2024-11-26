package main

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"github.com/ipfs/go-cid"
	dht "github.com/libp2p/go-libp2p-kad-dht"
)

func SaveMapAsJson(filename string, cidMap map[string]FileInfo) error {
	// Convert the map to pretty-printed JSON
	data, err := json.MarshalIndent(cidMap, "", "  ")
	if err != nil {
		return err
	}

	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(data)
	return err
}

func LoadMapAsJson(filename string) (map[string]FileInfo, error) {
	data := make(map[string]FileInfo)
	file, err := os.Open(filename)
	if err != nil {
		return data, err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	err = decoder.Decode(&data)
	return data, err

}

func RepublishFiles(cidMap map[string]FileInfo, ctx context.Context, dht *dht.IpfsDHT) {
	for cid_, fileInfo_ := range cidMap {
		if fileInfo_.Published {
			cid, err := cid.Decode(cid_)
			if err != nil {
				log.Fatal(err)
			}
			err = dht.Provide(ctx, cid, true)
			if err != nil {
				log.Fatal("Error republishing file", err)
			}
		}
	}
}
