import type { SubsidiaryUUID, CacheUUID, CacheObject } from "@shared/types/cache";
// import { derived, get, writable } from "svelte/store";

type CacheObjects = {
  [key: CacheUUID]: CacheObject;
};

class CacheStore {
  // private cacheStore = writable<CacheObjects>({});
  // private globalCache: { [key: CacheUUID]: SubsidiaryUUID } = {};

  constructor() {
    const ws = new WebSocket("ws://127.0.0.1:69420");

    // EXAMPLE: To send a blob over the websocket
    const blob = new Blob([
      /* image data */
    ]);
    const reader = new FileReader();

    reader.onloadend = function () {
      // reader.result contains the ArrayBuffer.
      ws.send(reader.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(blob);
  }
}

export const cacheStore = new CacheStore();
