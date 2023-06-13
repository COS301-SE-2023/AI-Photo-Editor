import type { ElectronMainApi } from "electron-affinity/main";
// import type { Blix } from "../Blix"

import { platform } from "os";
import logger from "../../utils/logger";

export class UtilApi implements ElectronMainApi<UtilApi> {
  private _counter = 0;
  // private _blix: Blix

  constructor() {
    // this._blix = blix;
  }

  async getSystemStatus() {
    return platform().toString();
  }

  async count() {
    logger.log("Handling invoke call");
    return this._counter++;
  }
}
