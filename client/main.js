const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const {BrowserWindow, ipcMain, globalShortcut} =  require('electron');

const path = require('path');
const url = require('url');
const server = require('../app')
//const {GET_ALL_PRINTERS} = require('src/utils/constants');

const contextMenu = require('electron-context-menu');
 
contextMenu({
    prepend: (params, browserWindow) => [{
        label: 'Rainbow',
        // Only show it when right-clicking images
        visible: params.mediaType === 'image'
    }]
});


const GET_ALL_PRINTERS = 'get-all-printers';
const RETURN_VALUE = 'return-value';
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1000, height: 750, backgroundColor: '#fff'});
    
    // and load the index.html of the app.
    const isDev = true;
    const startUrl = isDev ? "http://localhost:8000" : process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    mainWindow.loadURL(startUrl);
    mainWindow.setMenuBarVisibility(false);

    // Allow refresh page
    globalShortcut.register('f5', function() {
		mainWindow.reload()
	})

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    
}

ipcMain.on(GET_ALL_PRINTERS, (event) => {
    let list = mainWindow.webContents.getPrinters();
    event.sender.send(RETURN_VALUE, list); 
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
    
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.