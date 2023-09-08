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
import type { Setting, UserSettingsCategory, QueryResponse } from "../../../../shared/types";
// import dotenv from "dotenv";
// dotenv.config();

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
      model: "GPT-3.5",
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
  async saveUserSettings(newSettings: Setting[]): Promise<QueryResponse> {
    for (const setting of newSettings) {
      if (setting.secret) {
        setSecret(setting.id, setting.value.toString());
      } else settings.set(setting.id, setting.value);
    }

    return { status: "success" };
  }

  // This will have to be cleaned up later. Kinda a temp implementation rn
  async getUserSettings() {
    // const secrets = getSecrets();

    const userSettings: UserSettingsCategory[] = [
      {
        id: "ai_settings",
        title: "AI Settings",
        settings: [
          {
            id: "OPENAI_API_KEY",
            title: "Open AI Key",
            subtitle: "Required to use Open AI models such as GPT-3.5",
            type: "password",
            secret: true,
            value: getSecret("OPENAI_API_KEY"),
          },
        ],
      },
      {
        id: "keybind_settings",
        title: "Keybindings",
        settings: [
          {
            id: "Keybindings",
            title: "Keybindings",
            subtitle: "Customize your keybindings",
            type: "preferences",
            secret: false,
            value: settings.get("Keybindings"),
          },
        ],
      },
    ];

    return { status: "success", data: userSettings } satisfies QueryResponse;
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
}
