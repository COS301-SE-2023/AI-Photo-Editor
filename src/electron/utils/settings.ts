import ElectronStore from "electron-store";
import { safeStorage } from "electron";

interface Settings {
  check: boolean;
  secrets: {
      OPENAI_API_KEY: string;
  }
}

type Secret = keyof Settings["secrets"];

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
export function setSecret(key: Secret, value: string): void {
  if(safeStorage.isEncryptionAvailable()) {
    settings.set(key, safeStorage.encryptString(value).toString('base64'));
  }
}

export function getSecret(key: Secret): string {
  return safeStorage.decryptString(Buffer.from(settings.get(key) as string, 'base64'));
}

export function clearSecret(key: Secret): void {
  settings.set(key, "");
}

export default settings;
