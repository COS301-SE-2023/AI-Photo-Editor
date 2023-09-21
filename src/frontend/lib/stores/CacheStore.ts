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

const MESSAGE_ID_SIZE = 32; // bytes

// String of MESSAGE_ID_SIZE random bytes in hex
const randomMessageId = () => {
  return Array.from({ length: MESSAGE_ID_SIZE / 2 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join("");
};

class CacheStore {
  private cacheStore = writable<CacheObjects>({});
  // private globalCache: { [key: CacheUUID]: SubsidiaryUUID } = {};
  private ws: WebSocket;
  private lobby: { [key: string]: (value: Blob) => void };

  constructor() {
    this.ws = new WebSocket("ws://localhost:60606");
    this.lobby = {};

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
        } else if (event.data instanceof Blob) {
          // Check if there's a listener in the lobby
          event.data
            .slice(0, MESSAGE_ID_SIZE)
            .text()
            .then((messageId) => {
              if (this.lobby[messageId] != null) {
                // Listener found, resolve promise
                const payload = (event.data as Blob).slice(MESSAGE_ID_SIZE);
                this.lobby[messageId](payload);
                delete this.lobby[messageId];
              }
            })
            .catch((err) => null);
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

  public async get(uuid: CacheUUID): Promise<Blob> {
    const messageId = randomMessageId();
    const messageIdBlob = new Blob([messageId]);

    const payload = JSON.stringify({ type: "cache-get", id: uuid, messageId } as CacheRequest);

    return new Promise((resolve, reject) => {
      this.lobby[messageId] = resolve;
      this.ws.send(payload);
    });
  }

  public get subscribe() {
    return this.cacheStore.subscribe;
  }
}

export const cacheStore = new CacheStore();
