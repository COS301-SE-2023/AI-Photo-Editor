import { ipcMain, BrowserWindow } from "electron";
import { IEditPhoto } from "./interfaces";

import fs from "fs";
import { Edit } from "./exposed-functions";

const edit = new Edit();

export default class Handlers {
  private editFileHandler(mainWindow: BrowserWindow | null) {

    ipcMain.on("editPhoto", async (event, data: IEditPhoto) => {
        mainWindow?.webContents.send("chosenFile", await edit.editPhoto(data));
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
