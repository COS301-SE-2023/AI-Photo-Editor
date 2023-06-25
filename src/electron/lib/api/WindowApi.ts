import type { BrowserWindow } from "electron";
import type { AwaitedType } from "electron-affinity/main";
import { bindWindowApi } from "electron-affinity/main";

// Window APIs
import type { CommandRegistryApi } from "@frontend/api/CommandRegistryApi";
import type { ClientGraphApi } from "@frontend/api/ClientGraphApi";
import type { ClientProjectApi } from "@frontend/api/ClientProjectApi";

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
      clientGraphApi: await bindWindowApi<ClientGraphApi>(window, "ClientGraphApi"),
      clientProjectApi: await bindWindowApi<ClientProjectApi>(window, "ClientProjectApi"),
    },
  });
}

export type MainWindow = AwaitedType<typeof bindMainWindowApis>;
