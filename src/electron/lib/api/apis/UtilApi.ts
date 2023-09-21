import { shell } from "electron";
import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { platform, type, release } from "os";
import logger from "../../../utils/logger";
import { type UUID } from "../../../../shared/utils/UniqueEntity";
import {
  getSecrets,
  setSecret,
  clearSecret,
  getRecentProjects,
  settings,
  getSecret,
  type Settings,
} from "../../../utils/settings";
import type { QueryResponse, SettingComponent } from "../../../../shared/types";
import { type ChatModel } from "../../../lib/ai/Model";
import { autoUpdater } from "electron-updater";
// import dotenv from "dotenv";
// dotenv.config();

// Exposes basic system information
export class UtilApi implements ElectronMainApi<UtilApi> {
  private blix: Blix;

  constructor(blix: Blix) {
    this.blix = blix;
  }

  async getInfo() {
    return {
      system: {
        nodeVersion: process.version,
        platform: platform().toString(),
        type: type(),
        version: release(),
      },
      blix: {
        version: autoUpdater.currentVersion.version,
      },
    };
  }

  // ========== Update events are handled in index.ts ========== //

  async checkForUpdates() {
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      logger.error(JSON.stringify(error));
    }
  }

  async quitAndInstallUpdate() {
    autoUpdater.quitAndInstall();
  }

  async downloadUpdate() {
    try {
      autoUpdater.downloadUpdate();
    } catch (error) {
      logger.error(JSON.stringify(error));
    }
  }

  async sendPrompt(prompt: string, id: UUID): Promise<QueryResponse> {
    if (!prompt) {
      return {
        status: "error",
        message: "Prompt is empty",
      };
    }

    if (!this.blix.graphManager.getGraph(id)) {
      return {
        status: "error",
        message: "No graph selected",
      };
    }

    const response = await this.blix.aiManager.executePrompt({
      prompt,
      graphId: id,
      // model: "PaLM-Chat",
      // apiKey: process.env.PALM_API_KEY || "",
      model: settings.get("model") as ChatModel,
      apiKey: getSecret("OPENAI_API_KEY"),
    });

    if (!response.success) {
      return {
        status: "error",
        message: response.message,
      };
    }

    return {
      status: "success",
      message: response.message,
    };
  }

  // Add something extra validation

  async saveUserSetting(setting: SettingComponent) {
    return await this.saveUserSettings([setting]);
  }

  async saveUserSettings(newSettings: SettingComponent[]): Promise<QueryResponse> {
    for (const setting of newSettings) {
      if (setting.secret) {
        setSecret(setting.id, setting.value.toString());
      } else {
        settings.set(setting.id, setting.value);
      }
    }

    return { status: "success" };
  }

  /** Retrieve a user setting from the ElectronStore. */
  async getUserSetting(setting: SettingComponent | string) {
    let key = "";

    if (typeof setting === "string") {
      key = setting;
    } else {
      key = setting.secret ? `secrets.${setting.id}` : setting.id;
    }

    if (settings.has(key)) {
      let data: unknown;

      if (key.startsWith("secrets.")) {
        data = getSecret(key.replace("secrets.", ""));
      } else {
        data = settings.get(key);
      }

      return {
        status: "success",
        data,
      } satisfies QueryResponse;
    } else {
      return {
        status: "error",
        message: "Setting not found",
      } satisfies QueryResponse;
    }
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

  async saveState<T>(key: keyof Settings, value: T) {
    settings.set(key, value);
  }

  async getState<T>(key: string): Promise<T> {
    return settings.get(key);
  }

  async openLinkInBrowser(url: string) {
    shell.openExternal(url);
  }
}
