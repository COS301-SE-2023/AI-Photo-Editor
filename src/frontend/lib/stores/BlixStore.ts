import { writable } from "svelte/store";

interface BlixStore {
  systemInfo: {
    nodeVersion: string;
    systemPlatform: string;
    systemType: string;
    systemVersion: string;
  };
}

// Currently used to store some startup config. Can potentially be used to store
// some other global state in the future.
export const blixStore = writable<BlixStore>({
  systemInfo: {
    nodeVersion: "",
    systemPlatform: "",
    systemType: "",
    systemVersion: "",
  },
});
