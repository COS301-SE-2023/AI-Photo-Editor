import ElectronStore from "electron-store";
import { safeStorage } from "electron";
import logger from "./logger";
import type { KeyboardShortcut } from "../../shared/types";
import type { recentProject } from "../../shared/types/index";

export interface Settings {
  check: boolean;
  secrets: {
    OPENAI_API_KEY: string;
  };
  recentProjects: recentProject[];
  prompts: string[];
  model: string;
  keyboardShortcuts: KeyboardShortcut[];
  accentColor: string;
}

type DotUnionKeys<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? DotUnionKeys<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : "";
    }[keyof T]
  : "";

type SettingKey = DotUnionKeys<Settings>;

type Secret = keyof Settings["secrets"];

type UnencryptedSecrets = Record<string, string>;

// TODO: Perhaps add a schema for validation
export const settings = new ElectronStore<Settings>({
  defaults: {
    check: false,
    secrets: {
      OPENAI_API_KEY: "",
    },
    recentProjects: [],
    prompts: [],
    model: "GPT-3.5",
    keyboardShortcuts: [],
    accentColor: "f43e5c",
  },
});

// isEncryptionAvailable() conditions
// On Linux, returns true if the app has emitted the ready event and the secret key is available.
// On MacOS, returns true if Keychain is available.
// On Windows, returns true once the app has emitted the ready event.

/**
 * Stores a secret in the local settings store.
 * If encryption is available, the secret is encrypted before being stored.
 * @param key Identifier used to retrieve the secret
 * @param value Value to be stored for the secret
 * @returns void
 */

export function setSecret(key: string, value: string): void {
  if (safeStorage.isEncryptionAvailable()) {
    settings.set(`secrets.${key}`, safeStorage.encryptString(value).toString("base64"));
  } else {
    settings.set(`secrets.${key}`, value);
  }
}

/**
 * Retrieves a secret from the local settings store.
 * The secret is automically decrypted if encryption was used.
 * @param key Identifier used to retrieve the secret
 * @returns Secret value
 */

export function getSecret(key: string): string {
  const value = settings.get(`secrets.${key}`);
  if (!(typeof value === "string")) return "";
  return decryptWithSafeStorage(value);
}

/**
 * Decrypts all the secrets
 * @returns Decrypted secrets
 */
export function getSecrets(): UnencryptedSecrets {
  const storeSecrets = settings.get(`secrets`);

  if (!(typeof storeSecrets === "object")) return {};

  const secrets: UnencryptedSecrets = {};

  let key: keyof typeof storeSecrets;
  for (key in storeSecrets) {
    if (key in storeSecrets) {
      const encrypted = storeSecrets[key];
      secrets[key] = decryptWithSafeStorage(encrypted);
    }
  }

  return secrets;
}

/**
 * Decrypts a string using the safeStorage module
 * @param value Base64 encrypted string
 * @returns Unencrypted string
 */
export function decryptWithSafeStorage(value: string) {
  if (safeStorage.isEncryptionAvailable()) {
    try {
      return value ? safeStorage.decryptString(Buffer.from(value, "base64")) : "";
    } catch (error) {
      logger.error(error);
      return "";
    }
  } else {
    return value ? value : "";
  }
}

/**
 * Clears a secret from the local settings store.
 * @param key Identifier used to retrieve the secret
 * @returns void
 */
export function clearSecret(key: string): void {
  settings.set(`secrets.${key}`, "");
}

/**
 * Set the recent projects secret in the local settings store.
 * @param projects The recent projects to be stored
 * @returns void
 */
export function setRecentProjects(projects: recentProject[]) {
  settings.set("recentProjects", projects);
}

/**
 * Gets the recent projects from the local settings store.
 */
export function getRecentProjects() {
  return settings.get("recentProjects");
}

export default settings;
