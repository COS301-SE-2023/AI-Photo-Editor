import ElectronStore from "electron-store";
import { safeStorage } from "electron";
import logger from "./logger";

interface Settings {
  check: boolean;
  secrets: {
    OPENAI_API_KEY: string;
  };
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
const settings = new ElectronStore<Settings>({
  defaults: {
    check: false,
    secrets: {
      OPENAI_API_KEY: "",
    },
  },
});

// isEncryptionAvailable() conditions
// On Linux, returns true if the app has emitted the ready event and the secret key is available.
// On MacOS, returns true if Keychain is available.
// On Windows, returns true once the app has emitted the ready event.

export function setSecret(key: string, value: string): void {
  if (safeStorage.isEncryptionAvailable()) {
    settings.set(`secrets.${key}`, safeStorage.encryptString(value).toString("base64"));
  } else {
    settings.set(`secrets.${key}`, value);
  }
}

export function getSecret(key: string): string {
  const value = settings.get(`secrets.${key}`);
  if (!(typeof value === "string")) return "";
  return decryptWithSafeStorage(value);
}

/**
 * Decrypts all the secrets
 *
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
 *
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

export function clearSecret(key: string): void {
  settings.set(`secrets.${key}`, "");
}

export default settings;
