// This is the preload script for the webviews.

import {
  CacheMetadata,
  CacheRequest,
  CacheResponse,
  CacheWriteResponse,
} from "@shared/types/cache";

// It exposes some IPC functions so the webview can communicate with its parent renderer.
const { ipcRenderer, contextBridge } = require("electron");

const MESSAGE_ID_SIZE = 32; // bytes
// String of MESSAGE_ID_SIZE random bytes in hex
const randomMessageId = () => {
  return Array.from({ length: MESSAGE_ID_SIZE / 2 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join("");
};

const ws = new WebSocket("ws://localhost:60606");
ws.binaryType = "blob";

const lobby: { [key: string]: (value: Blob | any) => void } = {};

ws.onmessage = (event) => {
  if (typeof event.data === "string") {
    const payload = JSON.parse(event.data) as CacheResponse;
    const messageId = payload.messageId;

    if (lobby[messageId] != null) {
      lobby[messageId](payload);
      delete lobby[messageId];
    }
  } else if (event.data instanceof Blob) {
    // Check if there's a listener in the lobby
    event.data
      .slice(0, MESSAGE_ID_SIZE)
      .text()
      .then((messageId) => {
        if (lobby[messageId] != null) {
          // Listener found, resolve promise
          const data = event.data.slice(MESSAGE_ID_SIZE);
          lobby[messageId](data);
          delete lobby[messageId];
        }
      });
  }
};

// Low-level RPC wrapper for sending/receiving data with CacheManager
async function sendCachePayload(messageId: string, payload: Blob | string) {
  return new Promise((resolve, reject) => {
    lobby[messageId] = resolve;
    ws.send(payload);
  });
}

contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: any) => {
    ipcRenderer.sendToHost(channel, data);
  },
  on: (channel: string, func: (..._: any) => any) => {
    ipcRenderer.on(channel, (_event, args) => func(args));
  },
});

contextBridge.exposeInMainWorld("cache", {
  write: async (content: Blob, metadata?: CacheMetadata) => {
    // Write cache object
    const messageId = randomMessageId();
    const payload = new Blob([messageId, content]);
    const writeResp = (await sendCachePayload(messageId, payload)) as CacheWriteResponse;

    if (!writeResp.success) return null;

    if (metadata != null) {
      // Write cache metadata
      const metadataMessageId = randomMessageId();
      const metadataPayload = JSON.stringify({
        type: "cache-write-metadata",
        id: writeResp.id,
        messageId,
        metadata,
      } as CacheRequest);
      const metadataResp = (await sendCachePayload(
        metadataMessageId,
        metadataPayload
      )) as CacheResponse;
    }

    return writeResp.id;
  },
  get: async (id: string) => {
    const messageId = randomMessageId();
    const payload = JSON.stringify({ type: "cache-get", id, messageId } as CacheRequest);
    return sendCachePayload(messageId, payload);
  },
  delete: async (id: string) => {
    const messageId = randomMessageId();
    const payload = JSON.stringify({ type: "cache-delete", id, messageId } as CacheRequest);
    return sendCachePayload(messageId, payload);
  },
});
