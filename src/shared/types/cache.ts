import { type UUID } from "../../shared/utils/UniqueEntity";

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

export type CacheRequest = {
  type: string;
  id: string;
  messageId?: string;
  metadata?: CacheMetadata;
};

export type CacheWriteResponse = {
  success: boolean;
  id: CacheUUID;
};

export type CacheMetadata = {
  contentType: string;
  name?: string;
  other?: any;
};

export type CacheUpdateNotification = {
  type: string;
  cache: { uuid: string; metadata: CacheMetadata }[];
};
