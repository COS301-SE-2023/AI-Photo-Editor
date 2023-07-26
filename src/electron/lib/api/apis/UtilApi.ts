import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";

import { platform, type, release } from "os";
import logger from "../../../utils/logger";

// Exposes basic system information
export class UtilApi implements ElectronMainApi<UtilApi> {
  private blix: Blix;

  constructor(blix: Blix) {
    this.blix = blix;
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

  async sendPrompt(prompt: string) {
    this.blix.sendInformationMessage(prompt);
  }
}
