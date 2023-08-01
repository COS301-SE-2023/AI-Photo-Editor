import { app, BrowserWindow, Notification, protocol, Menu, MenuItem, dialog } from "electron";
import { join } from "path";
import { parse } from "url";
import { autoUpdater } from "electron-updater";

import logger from "./electron/utils/logger";
import settings from "./electron/utils/settings";

import { Blix } from "./electron/lib/Blix";
import { CoreGraphInterpreter } from "./electron/lib/core-graph/CoreGraphInterpreter";
import { exposeMainApis } from "./electron/lib/api/MainApi";
import { MainWindow, bindMainWindowApis } from "./electron/lib/api/apis/WindowApi";
import { platform } from "os";

const isProd = process.env.NODE_ENV === "production" || app.isPackaged;
// const isProd = true;

if (app.isPackaged) {
  process.env.NODE_ENV = "production";
}

logger.info("App starting...");
settings.set("check", true);
logger.info("Checking if settings store works correctly.");
logger.info(
  settings.get("check") ? "Settings store works correctly." : "Settings store has a problem."
);

// ========== MAIN PROCESS ========== //

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: "blix-image",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
    },
  },
]);

let mainWindow: MainWindow | null = null;
let notification: Notification | null = null;
let blix: Blix | null = null;

/**
 * Will run when Electron has finished initializing. 1. Blix is instantiated
 * which will bootstrap the registries 2. The main process IPC APIs will be
 * exposed to the renderer 3. The renderer process is instantiated which will
 * expose the window IPC APIs and bind to main process IPC APIs 4. The main
 * process will bind to the window IPC APIs 5. The Blix state is instantiated
 * and the various managers are initialized.
 */
app.on("ready", async () => {
  protocol.registerFileProtocol("blix-image", (request, callback) => {
    const url = request.url.slice("blix-image://".length);
    callback({ path: join(__dirname, "..", "..", url) });
  });

  // const coreGraphInterpreter = new CoreGraphInterpreter(new ToolboxRegistry);
  // coreGraphInterpreter.run();

  blix = new Blix();
  exposeMainApis(blix);
  await createMainWindow();

  if (mainWindow && blix) {
    await blix.init(mainWindow);
    if (blix.isReady) {
      mainWindow.apis.utilClientApi.onBlixReady();
    }
  } else {
    app.quit();
  }
});

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 1000,
    webPreferences: {
      devTools: true,
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: true,
      preload: join(__dirname, "electron/preload.js"),
    },
    // Set icon for Windows and Linux
    icon: isProd ? join(__dirname, "icon.png") : "public/images/icon.png",
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 10, y: 10 },
    // show: false,
  }) as MainWindow;

  const url =
    // process.env.NODE_ENV === "production"
    // isProd
    //   ? // in production, use the statically build version of our application
    //     `file://${join(__dirname, "..", "public", "index.html")}`
    //   : // in dev, target the host and port of the local rollup web server
    //     "http://localhost:5500";
    isProd
      ? // in production, use the statically build version of our application
        `file://${join(
          __dirname,
          // `${platform().toString() === "darwin" ? "../" : ""}public`,V
          "public",
          "index.html"
        )}`
      : // in dev, target the host and port of the local rollup web server
        "http://localhost:5500";

  try {
    await mainWindow.loadURL(url);
    await bindMainWindowApis(mainWindow);
  } catch (e) {
    logger.error(JSON.stringify(e));
    app.quit();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("ready-to-show", () => {
    if (blix?.isReady) {
      mainWindow?.apis.utilClientApi.onBlixReady();
    }
  });
}

// those two events are completely optional to subscrbe to, but that's a common way to get the
// user experience people expect to have on macOS: do not quit the application directly
// after the user close the last window, instead wait for Command + Q (or equivalent).
// Noted. Will look into this later.
app.on("window-all-closed", () => {
  // blix.projectManager.saveAllProjects();
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  // blix.projectManager.saveAllProjects();
});

app.on("activate", () => {
  if (mainWindow === null) createMainWindow();
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

// ========== AUTO UPDATER ==========//

if (isProd)
  autoUpdater.checkForUpdates().catch((err) => {
    logger.error(JSON.stringify(err));
  });

autoUpdater.logger = logger;

autoUpdater.on("update-available", () => {
  notification = new Notification({
    title: "BLix",
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
    title: "Blix",
    body: "Your software is up to date.",
    silent: true,
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
});

autoUpdater.on("update-downloaded", () => {
  notification = new Notification({
    title: "Blix",
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
    title: "Blix",
    body: JSON.stringify(err),
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
});

// // Menu
// const menuBar = new Menu();

// // Onyl for macOS
// if (process.platform === "darwin") {
//   menuBar.append(
//     new MenuItem({
//       label: app.name,
//       submenu: [
//         { role: "about" },
//         { type: "separator" },
//         { role: "services" },
//         { type: "separator" },
//         { role: "hide" },
//         { role: "hideOthers" },
//         { role: "unhide" },
//         { type: "separator" },
//         { role: "quit" },
//       ],
//     })
//   );
// }

// const menu: { [key: string]: Menu } = {};

// // File
// menu.File = addItems([
//   new MenuItem({ label: "New Project" }),
//   new MenuItem({ type: "separator" }),
//   new MenuItem({ label: "Open Project" }),
//   new MenuItem({ type: "separator" }),
//   new MenuItem({ label: "Save Project" }),
// ]);

// // Help
// menu.Help = addItems([
//   new MenuItem({
//     label: "Help",
//     click: async () => {
//       // const { shell } = require('electron');
//       // await shell.openExternal('https://youtu.be/dQw4w9WgXcQ');
//       // Show a dialog box
//       await dialog.showMessageBox({
//         type: "info",
//         title: "Dialog Box",
//         message: "Hello, world!",
//         buttons: ["Ok"],
//       });
//     },
//   }),
// ]);

// // Add Items to Menu Bar
// for (const key in menu) {
//   if (Object.hasOwn(menu, key)) menuBar.append(new MenuItem({ label: key, submenu: menu[key] }));
// }

// // Set new Menu Bar
// Menu.setApplicationMenu(menuBar);

// function addItems(items: MenuItem[]): Menu {
//   const menu = new Menu();
//   items.forEach((item) => {
//     menu.append(item);
//   });
//   return menu;
// }
