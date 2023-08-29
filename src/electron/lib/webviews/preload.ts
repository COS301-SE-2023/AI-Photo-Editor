// This is the preload script for the webviews.
// It exposes some IPC functions so the webview can communicate with its parent renderer.
const { ipcRenderer, contextBridge } = require("electron");

const ws = new WebSocket("ws://localhost:60606");

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
    ws.send(
      JSON.stringify({
        type: "cache-write",
        id,
        content,
      })
    );
    // ipcRenderer.sendToHost("cache-write", { id, content });
  },
  get: (id: string) => {
    ws.send(
      JSON.stringify({
        type: "cache-get",
      })
    );
  },
  delete: (id: string) => {
    ws.send(
      JSON.stringify({
        type: "cache-delete",
      })
    );
  },
});
