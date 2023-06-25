import { bindMainApi, exposeWindowApi } from "electron-affinity/window";
import type { AwaitedType } from "electron-affinity/window";

// Main APIs
import type { UtilApi } from "@electron/lib/api/UtilApi";
import type { ProjectApi } from "@electron/lib/api/ProjectApi";
import type { PluginApi } from "@electron/lib/api/PluginApi";
import type { GraphApi } from "@electron/lib/api/GraphApi";

// Window APIs
import { CommandRegistryApi } from "./CommandRegistryApi";
import { CoreGraphApi } from "./CoreGraphApi";

/**
 * Initializes the application by exposing the window IPC APIs to the main
 * process and binding the main process IPC APIs to the window.
 */
export async function initializeAPIs() {
  exposeWindowApis();
  window.apis = await bindMainApis();
}

/**
 * Bind the main process APIs to the window.
 * If a new main process API is created then add it to this method.
 */
async function bindMainApis() {
  return {
    utilApi: await bindMainApi<UtilApi>("UtilApi"),
    projectApi: await bindMainApi<ProjectApi>("ProjectApi"),
    pluginApi: await bindMainApi<PluginApi>("PluginApi"),
    graphApi: await bindMainApi<GraphApi>("GraphApi"),
  };
}

/**
 * Exposes the window APIs to the main process.
 * If a new window API is created then add it to this method.
 */
function exposeWindowApis() {
  exposeWindowApi(new CommandRegistryApi());
  exposeWindowApi(new CoreGraphApi());
}

export type MainApis = AwaitedType<typeof bindMainApis>;
