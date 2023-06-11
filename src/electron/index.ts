import { app, BrowserWindow, Notification, Menu, MenuItem, dialog } from "electron";
import { join } from "path";
import fs from "fs";
import { parse } from "url";
import { autoUpdater } from "electron-updater";

import logger from "./utils/logger";
import settings from "./utils/settings";

import { PluginManager } from "./lib/plugins/PluginManager";
import Handlers from "./lib/handlers";
import { Blix } from "./lib/Blix";

const isProd = process.env.NODE_ENV === "production" || app.isPackaged;

logger.info("App starting...");
settings.set("check", true);
logger.info("Checking if settings store works correctly.");
logger.info(
  settings.get("check") ? "Settings store works correctly." : "Settings store has a problem."
);

// ========== MAIN PROCESS ========== //

let mainWindow: BrowserWindow | null;
let notification: Notification | null;

// Menu
const menuBar = new Menu();

// Onyl for macOS
if (process.platform === "darwin") {
  menuBar.append(
    new MenuItem({
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    })
  );
}

const menu: { [key: string]: Menu } = {};

// File
menu.File = addItems([
  new MenuItem({ label: "New Project" }),
  new MenuItem({ type: "separator" }),
  new MenuItem({ label: "Open Project" }),
  new MenuItem({ type: "separator" }),
  new MenuItem({ label: "Save Project" }),
]);

// Help
menu.Help = addItems([
  new MenuItem({
    label: "Help",
    click: async () => {
      // const { shell } = require('electron');
      // await shell.openExternal('https://youtu.be/dQw4w9WgXcQ');
      // Show a dialog box
      await dialog.showMessageBox({
        type: "info",
        title: "Dialog Box",
        message: "Hello, world!",
        buttons: ["Ok"],
      });
    },
  }),
]);

// Add Items to Menu Bar
for (const key in menu) {
  if (Object.hasOwn(menu, key)) menuBar.append(new MenuItem({ label: key, submenu: menu[key] }));
}

// Set new Menu Bar
Menu.setApplicationMenu(menuBar);

function addItems(items: MenuItem[]): Menu {
  const menu = new Menu();
  items.forEach((item) => {
    menu.append(item);
  });
  return menu;
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 1000,
    webPreferences: {
      devTools: !isProd,
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
  // app.dock.setMenu(menuBar);
  createWindow();
  if (mainWindow) {
    new Handlers(mainWindow);

    // Set icon for macOS
    if (process.platform === "darwin") {
      app.dock.setIcon("public/images/blix_64x64.png");
    }
  }
});

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

// ========== AUTO UPDATER ==========//

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

// ========== CREATE APPLICATION STATE ========== //
const blix: Blix = new Blix();

// ========== LOAD PLUGINS ========== //
// This must be done before creating the main window
const pluginManager = new PluginManager(blix);
pluginManager.loadPlugins();

// == DEV == //
import { CoreGraph } from "./lib/core-graph/Graph";
import {
  InputAnchorInstance,
  OutputAnchorInstance,
  NodeInstance,
} from "./lib/core-graph/ToolboxRegistry";
const g: CoreGraph = new CoreGraph();

// Create Node
const inputs: InputAnchorInstance[] = [];
const outputs: OutputAnchorInstance[] = [];
inputs.push(
  new InputAnchorInstance("number", "signature", "input_anchor1"),
  new InputAnchorInstance("number", "signature", "input_anchor2")
);
outputs.push(
  new OutputAnchorInstance("number", "signature", "output_anchor1"),
  new OutputAnchorInstance("number", "signature", "output_anchor2")
);
const node1: NodeInstance = new NodeInstance(
  "hello-plugin/node1",
  "node1",
  "node1",
  "node1",
  inputs,
  outputs
);
const node2: NodeInstance = new NodeInstance(
  "hello-plugin/node2",
  "node2",
  "node2",
  "node2",
  inputs,
  outputs
);
g.addNode(node1);
g.addNode(node2);

const nodes = g.getNodes;
const actualNode1 = Object.values(nodes)[0];
const actualNode2 = Object.values(nodes)[1];

logger.info("Node1: " + actualNode1.getUUID);
logger.info("Node2: " + actualNode2.getUUID);

// Test with ouput - > input
let a1 = Object.values(actualNode1.getAnchors)[2];
let a2 = Object.values(actualNode2.getAnchors)[0];
let response = g.addEdge(a1.getUUID, a2.getUUID);
logger.info(response);

// Test with input - > input
a1 = Object.values(actualNode1.getAnchors)[0];
a2 = Object.values(actualNode2.getAnchors)[0];
response = g.addEdge(a1.getUUID, a2.getUUID);
logger.info(response);

// Test with input - > output
a1 = Object.values(actualNode1.getAnchors)[1];
a2 = Object.values(actualNode2.getAnchors)[2];
response = g.addEdge(a1.getUUID, a2.getUUID);
logger.info(response);

// Test with output - > output
a1 = Object.values(actualNode1.getAnchors)[2];
a2 = Object.values(actualNode2.getAnchors)[3];
response = g.addEdge(a1.getUUID, a2.getUUID);
logger.info(response);

// Expected:
// True
// False
// False
// False

g.printGraph();
