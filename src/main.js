const path = require('path');
const url = require('url');
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const installExtension = require('electron-devtools-installer').default;
const { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer');

function createWindow() {
    let win = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: __dirname + '/img/iconimage.webp',
    });

// installExtension(REACT_DEVELOPER_TOOLS);
// installExtension(REDUX_DEVTOOLS);

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true,
        })
    );

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    app.quit();
});
