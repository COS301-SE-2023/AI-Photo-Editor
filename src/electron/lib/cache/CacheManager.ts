// Blix caching system primarily for large binary objects
import type {
  SubsidiaryUUID,
  CacheUUID,
  CacheSubsidiary,
  CacheObject,
  CacheRequest,
} from "../../../shared/types/cache";

import WebSocket from "ws";
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
      // console.log("CacheManager connection: ");

      // Register new subsidiary
      const subUUID = randomBytes(32).toString("base64url");

      socket.on("message", (message: string) => {
        logger.info("CacheManager received message: ", JSON.parse(message));
        // Maybe look at the types
        const data = JSON.parse(message);

        switch (data.type) {
          case "cache-write":
            // console.log("CacheManager received cache-write request");
            socket.send("Hello from ChaceManager");
            break;

          case "cache-get":
            // console.log("CacheManager received cache-get request");
            break;

          case "cache-delete":
            // console.log("CacheManager received cache-delete request");
            break;

          default:
          // console.log("CacheManager received unknown request");
        }
      }); // TODO

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

  write(content: Blob, metadata: any): CacheUUID {
    const cacheUUID = randomBytes(32).toString("base64url");
    this.cache[cacheUUID] = { uuid: cacheUUID, data: content, metadata };
    return cacheUUID;
  }

  get(cacheUUID: CacheUUID): CacheObject {
    return this.cache[cacheUUID];
  }

  delete(cacheUUID: CacheUUID) {
    delete this.cache[cacheUUID];
  }
}
