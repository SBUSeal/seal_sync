const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Create the browser window.
  const iconPath = path.join(__dirname, 'frontend', 'src', 'images', 'seal_logo_vUs_icon.ico');
  const isDev = process.env.NODE_ENV === 'development';
  console.log(iconPath);
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'SealShare',
    icon: path.join(__dirname, 'src', 'images', 'seal_logo_vUs_icon.ico'),
    webPreferences: {
      nodeIntegration: true, // Optional, to use Node.js features in the renderer process
    },
  });

  // Load the React app (from the development server).
  mainWindow.loadURL('http://localhost:3000');
  /*if(isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'build', 'index.html'));//Production mode, set auto after running npm run build in ./frontend and package the app
  }*/
  mainWindow.setTitle('SealShare');

  //mainWindow.webContents.openDevTools();// Open the DevTools (optional).

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization.
app.whenReady().then(createWindow);

// Quit the app when all windows are closed (except on macOS).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, recreate the window when the app is reactivated.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});