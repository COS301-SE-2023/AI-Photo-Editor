import { app, BrowserWindow, Notification, Menu } from "electron";
import { join } from "path";
import fs from "fs";
import { parse } from "url";
import { autoUpdater } from "electron-updater";

import Handlers from "./lib/handlers";
import logger from "./utils/logger";
import settings from "./utils/settings";

const isProd = process.env.NODE_ENV === "production" || app.isPackaged;

logger.info("App starting...");
settings.set("check", true);
logger.info("Checking if settings store works correctly.");
logger.info(
  settings.get("check") ? "Settings store works correctly." : "Settings store has a problem."
);

let mainWindow: BrowserWindow | null;
let notification: Notification | null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 1000,
    webPreferences: {
      devTools: isProd ? false : true,
      contextIsolation: true,
      preload: join(__dirname, "preload.js"),
    },
    // Set icon for Windows and Linux
    icon: "public/images/blix_64x64.png",
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 10, y: 10 },
  });

  Menu.setApplicationMenu(null);

  const url =
    // process.env.NODE_ENV === "production"
    isProd
      ? // in production, use the statically build version of our application
        `file://${join(__dirname, "public", "index.html")}`
      : // in dev, target the host and port of the local rollup web server
        "http://localhost:5500";

  mainWindow.loadURL(url).catch((err) => {
    logger.error(JSON.stringify(err));
    app.quit();
  });

  // if (!isProd) mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // mainWindow.on('ready-to-show', () => {
  //   if (process.platform === 'darwin' && mainWindow) {
  //     const padding = mainWindow.getTrafficLightPosition().x;
  //     mainWindow.setSheetOffset(padding);
  //   }
  // });
};

app.on("ready", () => {
  createWindow();
  if (mainWindow) {
    new Handlers(mainWindow);

    // Set icon for macOS
    if (process.platform === "darwin") {
      app.dock.setIcon("public/images/blix_64x64.png");
    }
  }
});

// app.whenReady((event) => {
//   ipcMain.handle('test', test)
//   createWindow();
// })

// those two events are completely optional to subscrbe to, but that's a common way to get the
// user experience people expect to have on macOS: do not quit the application directly
// after the user close the last window, instead wait for Command + Q (or equivalent).
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

app.on("web-contents-created", (e, contents) => {
  logger.info(e);
  // Security of webviews
  contents.on("will-attach-webview", (event, webPreferences, params) => {
    logger.info(event, params);
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;

    // Verify URL being loaded
    // if (!params.src.startsWith(`file://${join(__dirname)}`)) {
    //   event.preventDefault(); // We do not open anything now
    // }
  });

  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedURL = parse(navigationUrl);
    // In dev mode allow Hot Module Replacement
    if (parsedURL.host !== "localhost:5500" && !isProd) {
      logger.warn("Stopped attempt to open: " + navigationUrl);
      event.preventDefault();
    } else if (isProd) {
      logger.warn("Stopped attempt to open: " + navigationUrl);
      event.preventDefault();
    }
  });
});

if (isProd)
  autoUpdater.checkForUpdates().catch((err) => {
    logger.error(JSON.stringify(err));
  });

autoUpdater.logger = logger;

autoUpdater.on("update-available", () => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: "Updates are available. Click to download.",
    silent: true,
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
  notification.on("click", () => {
    autoUpdater.downloadUpdate().catch((err) => {
      logger.error(JSON.stringify(err));
    });
  });
});

autoUpdater.on("update-not-available", () => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: "Your software is up to date.",
    silent: true,
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
});

autoUpdater.on("update-downloaded", () => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: "The updates are ready. Click to quit and install.",
    silent: true,
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
  notification.on("click", () => {
    autoUpdater.quitAndInstall();
  });
});

autoUpdater.on("error", (err) => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: JSON.stringify(err),
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
});

const tempDirPath = join(app.getPath("userData"), "temp");

if (!fs.existsSync(tempDirPath)) {
  fs.mkdirSync(tempDirPath);
}
