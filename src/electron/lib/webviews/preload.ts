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

contextBridge.exposeInMainWorld("cache", {
  write: (id: string, content: Blob) => {
    ipcRenderer.sendToHost("cache-write", { id, content });
  },
  get: (id: string) => {
    ipcRenderer.sendToHost("cache-get", { id });
  },
  delete: (id: string) => {
    ipcRenderer.sendToHost("cache-delete", { id });
  },
});
