import type { BrowserWindow } from "electron";
import { AwaitedType, bindWindowApi } from "electron-affinity/main";

// This import generates big problems, apparently I can't import from frontend code?
// import type { CommandRegistryApi } from "../../../frontend/api/CommandRegistryApi"

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
    },
  });
}

export type MainWindow = AwaitedType<typeof bindMainWindowApis>;

// Code to fix broken shit...rip
// Import from top of file from frontend should replace all this code
import type { ElectronWindowApi } from "electron-affinity/window";
import logger from "../../utils/logger";

class CommandRegistryApi implements ElectronWindowApi<CommandRegistryApi> {
  registryChanged(results: string) {
    logger.log("function can't be empty lol");
  }
}
