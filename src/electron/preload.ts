import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  changeBrightness: (data: number) => {
    ipcRenderer.send("change-brightness", data);
  },
  chooseFile: () => ipcRenderer.send('chooseFile'),
  receive: (channel: string, func: (arg0: any) => void) => {
    const validChannels = ["fromMain", "pong", "chosenFile"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, args) => func(args));
    }
  },
});
