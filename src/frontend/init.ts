import { bindMainApi, exposeWindowApi } from "electron-affinity/window";
import type { AwaitedType } from "electron-affinity/window";
import { blixStore } from "./stores/BlixStore";

// Main APIs
import type { UtilApi } from "../electron/lib/api/UtilApi";
import { ProjectApi } from "../electron/lib/api/ProjectApi";

// Window APIs
import { CommandRegistryApi } from "./api/CommandRegistryApi";

/**
 * Initializes the application by exposing the window IPC APIs to the main
 * process and binding the main process IPC APIs to the window.
 */
export async function init() {
  exposeWindowApis();
  window.apis = await bindMainApis();
  const res = await window.apis.utilApi.getSystemInfo();
  blixStore.set({ systemInfo: res });
}

/**
 * Bind the main process APIs to the window.
 * If a new main process API is created then add it to this method.
 */
async function bindMainApis() {
  return {
    utilApi: await bindMainApi<UtilApi>("UtilApi"),
    projectApi: await bindMainApi<ProjectApi>("ProjectApi"),
  };
}

/**
 * Exposes the window APIs to the main process.
 * If a new window API is created then add it to this method.
 */
function exposeWindowApis() {
  exposeWindowApi(new CommandRegistryApi());
}

export type MainApis = AwaitedType<typeof bindMainApis>;
