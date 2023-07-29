import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { platform, type, release } from "os";
import logger from "../../../utils/logger";
import { type UUID } from "../../../../shared/utils/UniqueEntity";
import { getSecret, setSecret, clearSecret } from "../../../utils/settings";

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

  /**
   * This function takes in a key and then will save the key for the specified model to local storage.
   * Electron's safeStorage is used to encrypt/decrypt these keys.
   *
   * @param key Value mapped to a key in the ElctronStore settings configuration.
   * @param value Value to be store at the index of key in the ElectronStore settings configuration.
   */
  async saveSecret(key: string, value: string) {
    try {
      setSecret(key, value);
      this.blix.sendSuccessMessage(`${key} setting saved successfully.`);
    } catch (e) {
      logger.info(e);
      this.blix.sendErrorMessage(`There was an error saving your new ${key} setting.`);
    }
  }

  /**
   * This function will take in a key and request for it to be removed in the ElectronStore.
   *
   * @param key Value mapped to a key in the ElectronStore settings configuration.
   */
  async resetSecret(key: string): Promise<void> {
    try {
      clearSecret(key);
      this.blix.sendSuccessMessage(`${key} setting removed successfully.`);
    } catch (e) {
      logger.info(e);
      this.blix.sendErrorMessage(`There was an error removing your ${key} setting.`);
    }
  }
}
