import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  changeBrightness: (data: number) => {
    ipcRenderer.send("ping", data);
  },
  receive: (channel: string, func: (arg0: any) => void) => {
    const validChannels = ["fromMain", "pong"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, args) => func(args));
    }
  },
});
