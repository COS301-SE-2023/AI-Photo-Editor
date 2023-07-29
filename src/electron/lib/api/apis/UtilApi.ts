import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";

import { platform, type, release } from "os";
import logger from "../../../utils/logger";
import { type UUID } from "@shared/utils/UniqueEntity";
import type {
  NotificationTypes,
} from "../../ai/AiManager";
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
   * @param model The model specified by the user.
   */
  async saveSuperSecretKey(key: string, model: string) {
      if(!await this.supportedModel(model)) {
        return this.handleNotification(`The ${model} model is not currently supported`, "warn");
      }
      let confirmation = false;
      const oldSuperSecretKey = getSecret(`secrets.${model.toUpperCase()}_API_KEY` as any);
      if(oldSuperSecretKey) {
        confirmation = true; // TODD: Implement some sort of user confirmation
      }
     try { 
        if(confirmation) { 
          setSecret(`secrets.${model.toUpperCase()}_API_KEY` as any, key);
          this.handleNotification(`${model} key saved successfully`, "success");
        }
      } catch (e) {
        logger.info(e);
        this.handleNotification(`There was an error saving your new ${model} model key.`, "error");
      }
  }

  /**
   * This function will if a key exists from local storage for the passed in model
   *
   * @param model Model of which the key must be removed
   */
  async removeSuperSecretKey(model: string): Promise<void> {
    if(!await this.supportedModel(model)) {
      return this.handleNotification(`The ${model} model is not currently supported`, "warn");
    }
    const key = getSecret(`secrets.${model.toUpperCase()}_API_KEY`as any);
    let message = "";
    let type: NotificationTypes;
    if (key) {
      clearSecret(`secrets.keys.${model.toUpperCase()}_API_KEY` as any);
      message = `${model} model key deleted successfully`;
      type = "success";
    } else {
      message = `No key exists for the ${model} model`;
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

  async supportedModel(model: string): Promise<boolean> {
    const models = this.blix.aiManager.getSupportedModels();
    return models.includes(model);
  }
}
