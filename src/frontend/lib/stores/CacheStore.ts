import type {
  SubsidiaryUUID,
  CacheUUID,
  CacheObject,
  CacheUpdateNotification,
  CacheMetadata,
  CacheRequest,
  CacheWriteResponse,
} from "@shared/types/cache";
import { derived, get, writable } from "svelte/store";

// type CacheObjects = {
//   [key: CacheUUID]: CacheObject;
// };

type CacheObjects = { [key: CacheUUID]: CacheMetadata };
// type CacheObjects = CacheUUID[];

class CacheStore {
  private cacheStore = writable<CacheObjects>({});
  // private globalCache: { [key: CacheUUID]: SubsidiaryUUID } = {};
  private ws: WebSocket;

  constructor() {
    this.ws = new WebSocket("ws://localhost:60606");

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({ type: "cache-subscribe" }));

      this.ws.onmessage = (event) => {
        if (typeof event.data === "string") {
          const data: CacheUpdateNotification = JSON.parse(event.data) as CacheUpdateNotification;

          switch (data.type) {
            case "cache-update":
              this.cacheStore.update((store) => {
                for (const obj of data.cache) {
                  store[obj.uuid] = obj.metadata;
                }

                return store;
              });
              break;
          }
        }
      };
    };
  }

  public addCacheObject(blob: Blob, metadata?: CacheMetadata) {
    if (metadata != null) {
      const recv = (event: MessageEvent<any>) => {
        this.ws.removeEventListener("message", recv);
        if (typeof event.data === "string") {
          const data = JSON.parse(event.data) as CacheWriteResponse;
          this.ws.send(JSON.stringify({ type: "cache-write-metadata", id: data.id, metadata }));
        }
      };
      this.ws.addEventListener("message", recv);
    }
    this.ws.send(blob);
  }

  public async get(uuid: CacheUUID): Promise<Buffer> {
    const payload = JSON.stringify({ type: "cache-get", id: uuid });

    return new Promise((resolve, reject) => {
      this.ws.send(payload);
      const recv = (event: MessageEvent<any>) => {
        this.ws.removeEventListener("message", recv); // Remove this listener
        resolve(event.data as Buffer);
      };
      this.ws.addEventListener("message", recv);
    });
  }

  public get subscribe() {
    return this.cacheStore.subscribe;
  }
}

export const cacheStore = new CacheStore();
