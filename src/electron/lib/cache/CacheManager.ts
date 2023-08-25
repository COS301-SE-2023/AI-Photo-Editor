// Blix caching system primarily for large binary objects

import type {
  SubsidiaryUUID,
  CacheUUID,
  CacheSubsidiary,
  CacheObject,
} from "../../../shared/types/cache";

import WebSocket from "ws";
import { randomBytes } from "crypto";
import logger from "utils/logger";

// The main interface which this manager must expose is:
//  - get(cacheUUID: CacheUUID): CacheObject
//  - write(content: Blob, metadata: any): CacheUUID

class CacheManager {
  subsidiaries: { [key: SubsidiaryUUID]: CacheSubsidiary };

  globalCache: { [key: CacheUUID]: SubsidiaryUUID };
  cache: { [key: CacheUUID]: CacheObject };

  server;

  constructor() {
    this.cache = {};
    this.subsidiaries = {};

    this.server = new WebSocket.Server({ port: 69420 });

    this.server.on("connection", (socket) => {
      // console.log("CacheManager connection: ", socket);

      // Register new subsidiary
      const subUUID = randomBytes(32).toString("base64url");

      this.server.on("message", (message, req) => {
        return;
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
