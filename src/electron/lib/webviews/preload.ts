// This is the preload script for the webviews.
// It exposes some IPC functions so the webview can communicate with its parent renderer.
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: any) => {
    ipcRenderer.sendToHost(channel, data);
  },
  on: (channel: string, func: (..._: any) => any) => {
    ipcRenderer.on(channel, (_event, args) => func(args));
  },
});
