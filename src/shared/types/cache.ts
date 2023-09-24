import { type UUID } from "../../shared/utils/UniqueEntity";

export const CACHE_MESSAGE_ID_SIZE = 32; // bytes

export enum CacheSubsidiaryType {
  Manager,
  Frontend,
  FileSystem,
  // Webview,
}

// Exposes websockets for communication with the renderer process
export type CacheUUID = UUID;
export type SubsidiaryUUID = UUID;

export type CacheSubsidiary = {
  uuid: SubsidiaryUUID;
  type: CacheSubsidiaryType;
  // socket: WebSocket
};

export type CacheObject = {
  uuid: CacheUUID;
  data: Buffer;
  metadata: CacheMetadata;
};

type CacheRequestType = "cache-subscribe" | "cache-delete" | "cache-get" | "cache-write-metadata";

export type CacheRequest = {
  type: CacheRequestType;
  id: string;
  messageId: string;
  metadata?: CacheMetadata;
};

export type CacheResponse = {
  success: boolean;
  messageId: string;
};

export type CacheWriteResponse = CacheResponse & { id: CacheUUID };

export type CacheMetadata = {
  contentType: string;
  name?: string;
  other?: any;
};

export type CacheUpdateNotification = {
  type: "cache-update";
  cache: { uuid: string; metadata: CacheMetadata }[];
};
