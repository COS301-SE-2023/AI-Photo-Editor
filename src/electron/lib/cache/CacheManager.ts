// Blix caching system primarily for large binary objects
import type {
  SubsidiaryUUID,
  CacheUUID,
  CacheSubsidiary,
  CacheObject,
  CacheRequest,
  CacheResponse,
} from "../../../shared/types/cache";

import WebSocket from "ws";
// import { Server } from "socket.io";
import { randomBytes } from "crypto";
import logger from "../../utils/logger";

// The main interface which this manager must expose is:
//  - get(cacheUUID: CacheUUID): CacheObject
//  - write(content: Blob, metadata: any): CacheUUID

export class CacheManager {
  // subsidiaries: { [key: SubsidiaryUUID]: CacheSubsidiary };

  // globalCache: { [key: CacheUUID]: SubsidiaryUUID };
  cache: { [key: CacheUUID]: CacheObject };

  server: WebSocket.Server;

  constructor() {
    this.cache = {};
    // this.subsidiaries = {};
    // this.globalCache = {};

    this.server = new WebSocket.Server({ port: 60606 });

    this.server.on("connection", (socket) => {
      const subUUID = randomBytes(32).toString("base64url");

      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          const data: CacheRequest = JSON.parse(event.data);

          switch (data.type) {
            case "cache-write-metadata":
              this.writeMetadata(data.id, data.metadata);
              break;
            case "cache-get":
              // TODO: check if exist
              socket.send(this.cache[data.id].data);
              break;
            case "cache-delete":
              this.delete(data.id);
              // TODO: check if exist
              socket.send(JSON.stringify({ success: true }));
              break;
            default:
              logger.info("Unknown cache message type", data.type);
          }
        } else if (event.data instanceof Buffer) {
          const id = this.writeContent(event.data);
          socket.send(JSON.stringify({ success: true, id }));
        } else {
          logger.info("unknown", event.data);
        }
      };

      this.server.on("error", (err) => {
        logger.error("Cache System error", err);
      });
    });
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
    this.cache[cacheUUID] = { uuid: cacheUUID, data: content, metadata: {} };
    return cacheUUID;
  }

  writeMetadata(cacheUUID: CacheUUID, metadata: any) {
    this.cache[cacheUUID].metadata = metadata;
  }

  get(cacheUUID: CacheUUID): CacheObject {
    return this.cache[cacheUUID];
  }

  delete(cacheUUID: CacheUUID) {
    delete this.cache[cacheUUID];
  }
}
