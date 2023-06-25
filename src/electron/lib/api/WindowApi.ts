import type { BrowserWindow } from "electron";
import type { AwaitedType } from "electron-affinity/main";
import { bindWindowApi } from "electron-affinity/main";

// Window APIs
import type { CommandRegistryApi } from "@frontend/api/CommandRegistryApi";
import type { CoreGraphApi } from "@frontend/api/CoreGraphApi";

/**
 * Binds the window APIs to the main process for every window.
 *
 * When creating a new window API add it to this method.
 *
 * @param window The the window to bind the APIs to
 */
export async function bindMainWindowApis(window: BrowserWindow) {
  return Object.assign(window, {
    apis: {
      commandRegistryApi: await bindWindowApi<CommandRegistryApi>(window, "CommandRegistryApi"),
      coreGraphApi: await bindWindowApi<CoreGraphApi>(window, "CoreGraphApi"),
    },
  });
}

export type MainWindow = AwaitedType<typeof bindMainWindowApis>;
