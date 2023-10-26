/* eslint-disable @typescript-eslint/naming-convention */
import { derived, writable } from "svelte/store";
import { commandStore } from "./CommandStore";
import { toolboxStore } from "./ToolboxStore";
import { tileStore } from "./TileStore";
import { shortcutsRegistry } from "./ShortcutStore";
import type { KeyboardShortcut } from "@shared/types";
import getPalette from "tailwindcss-palette-generator";

const blixStoreDefaults = {
  blixReady: false,
  production: false,
  system: {
    nodeVersion: "",
    platform: "",
    type: "",
    version: "",
  },
  blix: {
    version: "",
  },
  update: {
    isAvailable: false,
    isDownloaded: false,
    isDownloading: false,
    percentDownloaded: 0,
    version: "",
  },
  theme: {
    primary: {
      "50": "#ffb7c5",
      "100": "#ffaab9",
      "200": "#ff90a0",
      "300": "#ff7589",
      "400": "#ff5b72",
      "500": "#f43e5c",
      "600": "#d71a47",
      "700": "#bb0033",
      "800": "#9e0020",
      "900": "#82000e",
    },
  },
};

export type BlixStoreState = typeof blixStoreDefaults;
export type ColorPalette = { primary: Record<string, string> };

export class BlixStore {
  store = writable<BlixStoreState>(blixStoreDefaults);

  public refreshStore(state: Partial<BlixStoreState>) {
    this.store.update((s) => ({ ...s, ...state }));
  }

  /**
   * Sets the accent color of Blix. Defaults to the best color in the known
   * universe.
   *
   * @param color Hex color code
   * @param shade Shade at which pallette will be generated
   */
  public setPrimaryColor(color = "f43e5c", shade?: number) {
    let palette: ColorPalette;

    if (shade) {
      palette = getPalette({
        color,
        name: "primary",
        shade,
      }) as ColorPalette;
    } else {
      palette = getPalette(color) as ColorPalette;
    }

    const primaryColors: Record<string, string> = {};

    for (const [key, value] of Object.entries(palette.primary)) {
      if (key === "DEFAULT") continue;

      const hex = value.replace("#", "");

      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const primary = `--color-primary-${key}`;
      const rgb = `${r}, ${g}, ${b}`;

      document.documentElement.style.setProperty(primary, rgb);
      primaryColors[key] = value;
    }

    this.store.update((state) => {
      // @ts-expect-error
      state.theme.primary = primaryColors;
      return state;
    });
  }

  public primaryColor() {
    return derived(this.store, ($store) => {
      return $store.theme.primary["500"] as `#${string}`;
    });
  }

  public get subscribe() {
    return this.store.subscribe;
  }

  public update(fn: (state: BlixStoreState) => BlixStoreState) {
    this.store.update(fn);
  }
}

export const blixStore = new BlixStore();

// ==================================================================
// Utilities
// ==================================================================

export async function setInitialStores() {
  // BLix store
  const res = await window.apis.utilApi.getInfo();
  blixStore.refreshStore(res);

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
