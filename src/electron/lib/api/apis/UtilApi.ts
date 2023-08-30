import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { platform, type, release } from "os";
import logger from "../../../utils/logger";
import settings, { getSecret } from "../../../utils/settings";
import { type UUID } from "../../../../shared/utils/UniqueEntity";
import { getSecrets, setSecret, clearSecret } from "../../../utils/settings";
import type { Setting, UserSettingsCategory, QueryResponse } from "../../../../shared/types";

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
    if (this.blix.graphManager.getGraph(id)) {
      // const res = await this.blix.aiManager.sendPrompt(prompt, id);
      const response = await this.blix.aiManager.executePrompt({
        prompt,
        graphId: id,
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
        message: "Executed successfully",
      };
    } else {
      return {
        status: "error",
        message: "No graph selected",
      };
    }
  }

  // Add something extra validation
  async saveUserSettings(newSettings: Setting[]): Promise<QueryResponse> {
    for (const setting of newSettings) {
      if (setting.secret) {
        setSecret(setting.id, setting.value.toString());
      } else {
        settings.set(setting.value.toString(), setting.value);
      }
    }
    return { status: "success" };
  }

  // This will have to be cleaned up later. Kinda a temp implementation rn
  async getUserSettings(): Promise<QueryResponse<UserSettingsCategory[]>> {
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
    ];

    return { status: "success", data: userSettings };
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
