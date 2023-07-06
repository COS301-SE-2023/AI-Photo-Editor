import type { ElectronMainApi } from "electron-affinity/main";
// import type { Blix } from "../Blix"

import { platform, type, release } from "os";
import logger from "../../../utils/logger";

// Exposes basic system information
export class UtilApi implements ElectronMainApi<UtilApi> {
  private _counter = 0;
  // private _blix: Blix

  constructor() {
    // this._blix = blix;
  }

  async getSystemInfo() {
    const nodeVersion = process.version;
    const systemPlatform = platform().toString();
    const systemType = type();
    const systemVersion = release();

    return {
      nodeVersion,
      systemPlatform,
      systemType,
      systemVersion,
    };
  }

  async count() {
    logger.log("Handling invoke call");
    return this._counter++;
  }
}
