import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";

import { platform, type, release } from "os";
import logger from "../../../utils/logger";
import { type UUID } from "@shared/utils/UniqueEntity";

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

  async sendPrompt(prompt: string, id: UUID) {
    this.blix.sendInformationMessage(prompt);
    this.blix.sendInformationMessage(id);
    const res = await this.blix.aiManager.sendPrompt(prompt, id);
    this.blix.sendWarnMessage(JSON.stringify(res));
  }
}
