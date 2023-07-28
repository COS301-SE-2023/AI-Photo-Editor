import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";

import { platform, type, release } from "os";
import logger from "../../../utils/logger";
import { type UUID } from "@shared/utils/UniqueEntity";
import { safeStorage } from "electron";
import { readFile, writeFile } from "fs/promises";
import type {
  NotificationTypes,
  RetrieveKeyResponse,
  SuperSecretCredentials,
} from "../../ai/AiManager";
import { existsSync } from "fs";

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
   * @param model The model specified by the user.
   */
  async saveSuperSecretKey(key: string, model: string) {
    // On Linux, returns true if the app has emitted the ready event and the secret key is available.
    // On MacOS, returns true if Keychain is available.
    // On Windows, returns true once the app has emitted the ready event.
    if (safeStorage.isEncryptionAvailable()) {
      const superSecretKey = safeStorage.encryptString(key).toJSON().data;
      const oldSuperSecretKeys = await this.blix.aiManager.retrieveKey(model, false);
      const secrets = oldSuperSecretKeys.keys;
      // TODO: Refactor to make checks generic to set any key in the secrets object
      if (model === "OPENAI") {
        if (oldSuperSecretKeys.oldKey) {
          // if(confirm) Maybe we have prompt the user to confirm they want to replace an old key
        }
        secrets.OPENAI_API_KEY = superSecretKey;
      }
      // Update local encrypted keys
      try {
        const result = await writeFile(this.blix.aiManager.getFilePath(), JSON.stringify(secrets));
        this.handleNotification(`${model} key saved successfully`, "success");
      } catch (e) {
        logger.info(e);
        this.handleNotification(`There was an error saving your new ${model} key.`, "error");
      }
    } else {
      this.handleNotification(`Internal Error`, "error");
    }
  }

  /**
   * This function will if a key exists from local storage for the passed in model
   *
   * @param model Model of which the key must be removed
   */
  async removeSuperSecretKey(model: string): Promise<void> {
    const path = this.blix.aiManager.getFilePath();
    if (!existsSync(path)) this.handleNotification(`No key exists for ${model}`, "warn");
    const secrets: SuperSecretCredentials = JSON.parse(await readFile(path, "utf-8"));

    const key = `${model}_API_KEY`;
    let message = "";
    let type: NotificationTypes;

    if (key in secrets) {
      delete (secrets as any)[key];
      await writeFile(path, JSON.stringify(secrets));
      message = `${model} key deleted successfully`;
      type = "success";
    } else {
      message = `No key exists for ${model}`;
      type = "warn";
    }
    this.handleNotification(message, type);
  }
  /**
   * This function handles any responses needed to be sent to the user.
   *
   * @param message Content to be displayed
   * @param type Type to style the message
   */
  async handleNotification(message: string, type: NotificationTypes) {
    if (this.blix.mainWindow) this.blix.mainWindow.apis.utilClientApi.showToast({ message, type });
  }
}
