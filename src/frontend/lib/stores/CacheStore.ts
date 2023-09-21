import {
  type SubsidiaryUUID,
  type CacheUUID,
  type CacheObject,
  type CacheUpdateNotification,
  type CacheMetadata,
  type CacheRequest,
  type CacheWriteResponse,
  CACHE_MESSAGE_ID_SIZE,
  type CacheResponse,
} from "@shared/types/cache";
import { derived, get, writable, type Writable } from "svelte/store";

// type CacheObjects = {
//   [key: CacheUUID]: CacheObject;
// };

type CacheObjects = { [key: CacheUUID]: CacheMetadata };
// type CacheObjects = CacheUUID[];

// String of MESSAGE_ID_SIZE random bytes in hex
const randomMessageId = () => {
  return Array.from({ length: CACHE_MESSAGE_ID_SIZE / 2 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join("");
};

function isUpdateNotification(payload: any): payload is CacheUpdateNotification {
  return (payload as { type: string }).type === "cache-update";
}

class CacheStore {
  private cacheStore = writable<CacheObjects>({});
  // private globalCache: { [key: CacheUUID]: SubsidiaryUUID } = {};
  private ws: WebSocket;
  private lobby: { [key: string]: (value: Blob | any) => void };

  constructor() {
    this.ws = new WebSocket("ws://localhost:60606");
    this.lobby = {};

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({ type: "cache-subscribe" }));

      this.ws.onmessage = (event) => {
        if (typeof event.data === "string") {
          const payload = JSON.parse(event.data) as CacheResponse;

          if (isUpdateNotification(payload)) {
            // Handle notification
            this.cacheStore.update((store) => {
              for (const obj of payload.cache) {
                store[obj.uuid] = obj.metadata;
              }
              return store;
            });
          } else {
            // Handle response
            const messageId = payload.messageId;

            if (this.lobby[messageId] != null) {
              this.lobby[messageId](payload);
              delete this.lobby[messageId];
            }
          }
        } else if (event.data instanceof Blob) {
          // Check if there's a listener in the lobby
          event.data
            .slice(0, CACHE_MESSAGE_ID_SIZE)
            .text()
            .then((messageId) => {
              if (this.lobby[messageId] != null) {
                // Listener found, resolve promise
                const payload = (event.data as Blob).slice(CACHE_MESSAGE_ID_SIZE);
                this.lobby[messageId](payload);
                delete this.lobby[messageId];
              }
            })
            .catch((err) => null);
        }
      };
    };
  }

  // Low-level RPC wrapper for sending/receiving data with CacheManager
  async sendCachePayload(messageId: string, payload: Blob | string) {
    return new Promise((resolve, reject) => {
      this.lobby[messageId] = resolve;
      this.ws.send(payload);
    });
  }

  public async addCacheObject(blob: Blob, metadata?: CacheMetadata) {
    // this.ws.send(blob);
    // if (metadata != null) {
    //   const data = JSON.parse(event.data) as CacheWriteResponse;
    //   this.ws.send(JSON.stringify({ type: "cache-write-metadata", id: data.id, metadata }) as CacheRequest);
    // }

    // Write cache object
    const messageId = randomMessageId();
    const payload = new Blob([messageId, blob]);
    const writeResp = (await this.sendCachePayload(messageId, payload)) as CacheWriteResponse;

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
      (await this.sendCachePayload(metadataMessageId, metadataPayload)) as CacheResponse;
    }

    return writeResp.id;
  }

  public async get(uuid: CacheUUID): Promise<Blob> {
    const messageId = randomMessageId();

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
