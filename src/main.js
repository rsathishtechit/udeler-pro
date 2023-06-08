const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const cookie = require("cookie");

const { addRxPlugin } = require("rxdb");

const { getRxStorageMemory } = require("rxdb/plugins/storage-memory");
const { exposeIpcMainRxStorage } = require("rxdb/plugins/electron");

const { getDatabase } = require("./shared");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  ipcMain.on("login", (event, url) => {
    var dimensions = mainWindow.getSize();
    let udemyLoginWindow = new BrowserWindow({
      width: dimensions[0] - 100,
      height: dimensions[1] - 200,
      mainWindow,
      modal: true,
    });

    udemyLoginWindow.webContents.session.webRequest.onBeforeSendHeaders(
      { urls: ["*://*.udemy.com/*"] },
      function (request, callback) {
        const token = request.requestHeaders.Authorization
          ? request.requestHeaders.Authorization.split(" ")[1]
          : cookie.parse(request.requestHeaders.Cookie || "").access_token;

        if (token) {
          event.returnValue = token;
          udemyLoginWindow.destroy();
          // request.webContents.session.clearStorageData();
          request.webContents.session.webRequest.onBeforeSendHeaders(
            { urls: ["*://*.udemy.com/*"] },
            function (request, callback) {
              callback({ requestHeaders: request.requestHeaders });
            }
          );
          // checkLogin();
        }
        callback({ requestHeaders: request.requestHeaders });
      }
    );
    udemyLoginWindow.loadURL(url);
    // }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async function () {
  const storage = getRxStorageMemory();

  exposeIpcMainRxStorage({
    key: "main-storage",
    storage,
    ipcMain: ipcMain,
  });

  // const db = await getDatabase("udeler-dev", storage);

  // show heroes table in console
  // db.auth
  //   .find()
  //   .sort("token")
  //   .$.subscribe((authDocs) => {
  //     console.log("### got heroes(" + authDocs.length + "):");
  //     authDocs.forEach((doc) => console.log(doc.token));
  //   });
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
