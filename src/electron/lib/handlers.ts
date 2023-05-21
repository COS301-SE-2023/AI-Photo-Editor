import { ipcMain, BrowserWindow } from "electron";
import { IEditPhoto } from "./interfaces";

import logger from "../utils/logger";
import fs from "fs";
// import { test } from "./lib/exposed-functions"

export default class Handlers {
  private editFileHandler(mainWindow: BrowserWindow | null) {
    // ipcMain.handle("test", (event, args) => test(args));
    // ipcMain.on("change-brightness", (event, args) => {
    //    mainWindow?.webContents.send("chosenFile", test(args))
    // });

    ipcMain.on("editPhoto", (event, data: IEditPhoto) => {
      if (data.brightness !== undefined) {
        logger.info(data.brightness);
        mainWindow?.webContents.send("editPhoto", data.brightness);
      }
      if (data.saturation !== undefined) {
        logger.info(data.saturation);
        mainWindow?.webContents.send("editPhoto", data.saturation);
      }
      if (data.hue !== undefined) {
        logger.info(data.hue);
        mainWindow?.webContents.send("editPhoto", data.hue);
      }
      if (data.rotate !== undefined) {
        logger.info(data.rotate);
        mainWindow?.webContents.send("editPhoto", data.rotate);
      }
      if (data.shadow !== undefined) {
        logger.info(data.shadow);
        mainWindow?.webContents.send("editPhoto", data.shadow);
      }
    });
  }

  private chooseFileHandler(mainWindow: BrowserWindow | null) {
    ipcMain.on("chooseFile", () => {
      const base64 = fs.readFileSync("./assets/image.png").toString("base64");
      mainWindow?.webContents.send("chosenFile", base64);
    });
  }

  constructor(mainWindow: BrowserWindow | null) {
    this.editFileHandler(mainWindow);
    this.chooseFileHandler(mainWindow);
  }
}
