# Seal Share

**Frontend Setup**
*Install necessary dependencies:*

```sh
npm install
```

```sh
npm install axios @radix-ui/themes
```

*Start the frontend:*

Navigate to the frontend directory.

```sh
    cd frontend
```

and run:

```sh
npm start
```

To view the React-based app in your browser:
Open http://localhost:3000 to access the app in development mode.

To view the app in Electron, open a new terminal and run:

```sh
npm run electron
```

The app will open automatically in development mode. 

**Backend Setup**

Optional: Add CORS support (if needed):

`go get github.com/rs/cors`

*Run the backend:*

Navigate to the backend directory. 

 ```sh
    cd backend
```

Within main.go, replace the value for node_id with your own SBUID.

Open a new terminal and run:

```sh
go run .
```

This will run the go-based application, responsible for filesharing and backend functionalities. 

Note that bitcoind must be running in order to successfully register and interact with the rest of the application.