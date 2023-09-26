// Blix caching system primarily for large binary objects
import {
  type SubsidiaryUUID,
  type CacheUUID,
  type CacheSubsidiary,
  type CacheObject,
  type CacheRequest,
  type CacheUpdateNotification,
  type CacheWriteResponse,
  type CacheResponse,
  CACHE_MESSAGE_ID_SIZE,
} from "../../../shared/types/cache";

import WebSocket, { WebSocketServer } from "ws";
// import { Server } from "socket.io";
import { randomBytes } from "crypto";
import logger from "../../utils/logger";
import { app, ipcMain } from "electron";
import { showSaveDialog } from "../../utils/dialog";
import { join } from "path";
import { writeFile } from "fs/promises";

// The main interface which this manager must expose is:
//  - get(cacheUUID: CacheUUID): CacheObject
//  - write(content: Blob, metadata: any): CacheUUID

export class CacheManager {
  // subsidiaries: { [key: SubsidiaryUUID]: CacheSubsidiary };

  // globalCache: { [key: CacheUUID]: SubsidiaryUUID };
  cache: { [key: CacheUUID]: CacheObject };

  listeners: Set<WebSocket>;

  server: WebSocket.Server;

  constructor() {
    this.cache = {};
    this.listeners = new Set();

    ipcMain.on("cache-get", (event, id: string) => {
      // const id = this.writeContent(content);
      // event.returnValue = id;
      event.returnValue = this.get(id).data;
      // for (const listener of this.listeners) {
      //   listener.send(JSON.stringify({ type: "cache-update", cache: Object.keys(this.cache) }));
      // }
    });

    // ipcMain.on("cache-get", (event, id) => {
    //   event.returnValue = this.cache[id].data;
    // })
    // this.subsidiaries = {};
    // this.subsidiaries = {};
    // this.globalCache = {};

    this.server = new WebSocketServer({ port: 60606 });

    this.server.on("connection", (socket) => {
      const subUUID = randomBytes(32).toString("base64url");

      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          const data: CacheRequest = JSON.parse(event.data);
          // const data = JSON.parse(event.data);

          switch (data.type) {
            case "cache-write-metadata":
              this.writeMetadata(data.id, data.metadata);
              this.notifyListeners();
              socket.send(
                JSON.stringify({ success: true, messageId: data.messageId } as CacheResponse)
              );
              break;
            case "cache-get":
              const messageId = data.messageId;
              socket.send(
                Buffer.concat([
                  Buffer.from(messageId),
                  this.cache[data.id]?.data ?? Buffer.from([]),
                ])
              );
              break;
            case "cache-delete":
              if ("ids" in data && Array.isArray(data.ids)) {
                this.delete(data.ids as CacheUUID[]);
              }

              // TODO: check if exist
              socket.send(
                JSON.stringify({ success: true, messageId: data.messageId } as CacheResponse)
              );

              this.notifyListeners();
              break;

            case "cache-subscribe":
              this.listeners.add(socket);
              socket.send(JSON.stringify(this.cacheUpdateNotification)); // Send initial cache update
              break;
            case "export-cache":
              if ("ids" in data && Array.isArray(data.ids)) {
                this.export(data.ids as CacheUUID[]);
              }
              break;
            default:
              logger.info("Unknown cache message type", data.type);
          }
        } else if (event.data instanceof Buffer) {
          const messageId = event.data.subarray(0, CACHE_MESSAGE_ID_SIZE).toString("ascii");
          const data = event.data.subarray(CACHE_MESSAGE_ID_SIZE);

          const id = this.writeContent(data);
          socket.send(JSON.stringify({ success: true, id, messageId } as CacheWriteResponse));

          // Send cache update to all listeners
          this.notifyListeners();
        } else {
          logger.info("unknown", event.data);
        }
      };

      // If socket loses connection, remove it from listeners
      socket.onclose = () => {
        this.listeners.delete(socket);
      };
    });

    this.server.on("error", (err) => {
      logger.error("Cache System error", err);
    });
  }

  private notifyListeners() {
    const notification = this.cacheUpdateNotification;

    for (const listener of this.listeners) {
      listener.send(JSON.stringify(notification));
    }
  }

  private get cacheUpdateNotification(): CacheUpdateNotification {
    return {
      type: "cache-update",
      cache: Object.keys(this.cache).map((uuid) => ({ uuid, metadata: this.cache[uuid].metadata })),
    };
  }

  // TODO
  connect() {
    return;
  }

  writeLocal(content: Blob): CacheUUID {
    const cacheUUID = randomBytes(32).toString("base64url");
    return cacheUUID;
  }

  writeContent(content: Buffer): CacheUUID {
    const cacheUUID = randomBytes(32).toString("base64url");
    this.cache[cacheUUID] = {
      uuid: cacheUUID,
      data: content,
      metadata: { contentType: "unknown" },
    }; // TODO: Add content type
    return cacheUUID;
  }

  writeMetadata(cacheUUID: CacheUUID, metadata: any) {
    if (this.cache[cacheUUID] == null) {
      logger.warn("Tried writing metadata to non-existent cache object: ", cacheUUID);
      return;
    }
    this.cache[cacheUUID].metadata = metadata;
  }

  get(cacheUUID: CacheUUID): CacheObject {
    return this.cache[cacheUUID];
  }

  delete(cacheUUID: CacheUUID[]) {
    for (const uuid of cacheUUID) {
      delete this.cache[uuid];
    }
  }

  async export(ids: CacheUUID[]) {
    for (const id of ids) {
      const cacheObject = this.cache[id];

      if (!cacheObject) {
        continue;
      }

      const fileType = cacheObject.metadata.contentType.split("/")[1];
      let fileName = cacheObject.metadata.name || "export";

      if (!fileName.endsWith(`.${fileType}`)) {
        fileName = `${fileName}.${fileType}`;
      }

      const path = await showSaveDialog({
        title: "Save Asset",
        defaultPath: join(app.getPath("downloads"), fileName),
        properties: ["createDirectory"],
      });

      if (!path) {
        continue;
      }

      await writeFile(path, cacheObject.data);
    }
  }
}
