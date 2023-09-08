import type { SubsidiaryUUID, CacheUUID, CacheObject } from "@shared/types/cache";
import { derived, get, writable } from "svelte/store";

// type CacheObjects = {
//   [key: CacheUUID]: CacheObject;
// };

type CacheObjects = CacheUUID[];

type CacheResponse = {
  type: string;
  cache: CacheUUID[];
};

class CacheStore {
  private cacheStore = writable<CacheObjects>([]);
  // private globalCache: { [key: CacheUUID]: SubsidiaryUUID } = {};
  private ws: WebSocket;

  constructor() {
    this.ws = new WebSocket("ws://localhost:60606");

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({ type: "cache-subscribe" }));

      this.ws.onmessage = (event) => {
        if (typeof event.data === "string") {
          const data: CacheResponse = JSON.parse(event.data) as CacheResponse;

          switch (data.type) {
            case "cache-update":
              this.cacheStore.set(data.cache);
              break;
          }
        }
      };
    };
  }

  // public refreshStore(cacheId: CacheUUID) {
  //   this.cacheStore.update((cache) => {
  //     cache.push(cacheId)
  //     return cache;
  //   });
  // }

  public get subscribe() {
    return this.cacheStore.subscribe;
  }
}

export const cacheStore = new CacheStore();
