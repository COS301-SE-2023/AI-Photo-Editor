import { dialog, ipcMain, BrowserWindow } from "electron";
import { IEditPhoto } from "./interfaces";

import fs from "fs";
import { Edit } from "./exposed-functions";
import logger from "../utils/logger";

const edit = new Edit();

export default class Handlers {
  private mainWindow: BrowserWindow;
  private selectedFilePath: string;

  public editFileHandler() {
    ipcMain.on("editPhoto", async (event, data: IEditPhoto) => {
      if (!this.selectedFilePath) return;
      this.mainWindow.webContents.send(
        "chosenFile",
        await edit.editPhoto(data, this.selectedFilePath)
      );
    });
  }

  public chooseFileHandler() {
    ipcMain.on("chooseFile", () => {
      const base64 = fs.readFileSync("./assets/image.png").toString("base64");
      this.mainWindow.webContents.send("chosenFile", base64);
    });
  }

  public openFileDialogHandler() {
    ipcMain.on("open-file-dialog", async (event: Electron.IpcMainEvent) => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ["openFile"],
        filters: [{ name: "Images", extensions: ["png"] }],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        this.selectedFilePath = result.filePaths[0];
        fs.readFile(this.selectedFilePath, (err, data) => {
          if (err) {
            event.sender.send("selected-file", { error: err.message });
          } else {
            const base64Image = data.toString("base64");
            event.sender.send("selected-file", base64Image);
          }
        });
      }
    });
  }

  public exportSaveEditedImageHandler() {
    ipcMain.on("export-image", async () => {
      if (!this.selectedFilePath) return;

      const result = await dialog.showSaveDialog(this.mainWindow, {
        buttonLabel: "Save",
        filters: [{ name: "All Files", extensions: ["*"] }],
      });

      if (!result.canceled && result.filePath) {
        const readStream = fs.createReadStream("./assets/edited-image.png");
        const writeStream = fs.createWriteStream(result.filePath);
        readStream.pipe(writeStream);
        writeStream.on("error", (err) => {
          logger.error(err);
        });
        writeStream.on("finish", () => {
          logger.log(`File saved to ${result.filePath || ""}`);
        });
      }
    });
  }

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;

    this.editFileHandler();
    this.chooseFileHandler();
    this.openFileDialogHandler();
    this.exportSaveEditedImageHandler();
  }
}
