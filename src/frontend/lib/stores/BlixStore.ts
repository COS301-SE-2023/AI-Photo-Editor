import { writable } from "svelte/store";
import { commandStore } from "./CommandStore";
import { toolboxStore } from "./ToolboxStore";
import { tileStore } from "./TileStore";
import { shortcutsRegistry } from "./ShortcutStore";
import type { KeyboardShortcut } from "@shared/types";

const blixStoreDefaults = {
  blixReady: false,
  system: {
    nodeVersion: "",
    platform: "",
    type: "",
    version: "",
  },
  blix: {
    version: "",
  },
};

type BlixStoreState = typeof blixStoreDefaults;

export class BlixStore {
  store = writable<BlixStoreState>(blixStoreDefaults);

  public async checkForUpdates() {
    return await window.apis.utilApi.checkForUpdates();
  }

  public get subscribe() {
    return this.store.subscribe;
  }

  public update(fn: (state: BlixStoreState) => BlixStoreState) {
    this.store.update(fn);
  }
}

export const blixStore = new BlixStore();

export async function setInitialStores() {
  // BLix store
  const res = await window.apis.utilApi.getInfo();
  blixStore.update((state) => ({ ...state, ...res }));

  // Command store
  const command = await window.apis.commandApi.getCommands();
  commandStore.refreshStore(command);

  // Toolbox store
  const node = await window.apis.toolboxApi.getNodes();
  toolboxStore.refreshStore(node);

  // Tile store
  const tile = await window.apis.tileApi.getTiles();
  tileStore.refreshStore(tile);

  const shortcuts = await window.apis.utilApi.getUserSetting("keyboardShortcuts");
  if (shortcuts.status === "success") {
    // TODO: Add some sort of schema check
    shortcutsRegistry.refreshStore(shortcuts.data as KeyboardShortcut[]);
  }
}
