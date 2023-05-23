import { contextBridge, ipcRenderer } from "electron";
import { IEditPhoto } from "./lib/interfaces";

const api = {
  send: (channel: string, data: IEditPhoto) => {
    const validChannels = [
      "fromMain",
      "editPhoto",
      "chosenFile",
      "open-file-dialog",
      "selected-file",
      "export-image",
      "clear-file",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (arg0: any) => void) => {
    const validChannels = [
      "fromMain",
      "editPhoto",
      "chosenFile",
      "open-file-dialog",
      "selected-file",
      "export-image",
      "clear-file",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, args) => func(args));
    }
  },
  chooseFile: () => ipcRenderer.send("chooseFile"),
};

contextBridge.exposeInMainWorld("api", api);

export { api };
