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
  data: Blob;
  metadata: any;
};
