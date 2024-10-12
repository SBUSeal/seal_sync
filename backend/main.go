package main

import (
	"fmt"
	"net/http"
	//"github.com/rs/cors" idk it not needed
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/uploadFile", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		// Retrieve the file from form data
		file, handler, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Error retrieving file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		fmt.Fprintf(w, "Uploaded File: %+v\n", handler.Filename)
		fmt.Fprintf(w, "File Size: %+v\n", handler.Size)
		fmt.Fprintf(w, "MIME Header: %+v\n", handler.Header)

		// save file on server...
	})

	// // Set up the CORS handler
	// c := cors.New(cors.Options{
	// 	AllowedOrigins:   []string{"http://localhost:3000"},
	// 	AllowCredentials: true,
	// 	AllowedMethods:   []string{"POST"},
	// })

	// handler := c.Handler(mux)

	// Start the server
	fmt.Println("Server listening on :8080")
	http.ListenAndServe(":8080", mux)
}
