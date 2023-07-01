import { bindMainApi, exposeWindowApi } from "electron-affinity/window";
import type { AwaitedType } from "electron-affinity/window";

// Main APIs
import type { UtilApi } from "@electron/lib/api/apis/UtilApi";
import type { ProjectApi } from "@electron/lib/api/apis/ProjectApi";
import type { CommandApi } from "@electron/lib/api/apis/CommandApi";
import type { GraphApi } from "@electron/lib/api/apis/GraphApi";
import type { ToolboxApi } from "@electron/lib/api/apis/ToolboxApi";

// Window APIs
import { CommandRegistryApi } from "./CommandRegistryApi";

// stores
import { blixStore } from "../stores/BlixStore";
import { commandStore } from "../stores/CommandStore";
import { nodeStore } from "../stores/NodeStore";
import { ClientGraphApi } from "./ClientGraphApi";
import { ClientProjectApi } from "./ClientProjectApi";

/**
 * Initializes the application by exposing the window IPC APIs to the main
 * process and binding the main process IPC APIs to the window.
 */
export async function initializeAPIs() {
  exposeWindowApis();
  window.apis = await bindMainApis();
  const res = await window.apis.utilApi.getSystemInfo();
  // Get commands and nodes from plugins
  const command = await window.apis.commandApi.getCommands();
  const node = await window.apis.toolboxApi.getNodes();
  blixStore.set({ systemInfo: res });
  commandStore.refreshStore(command);
  nodeStore.refreshStore(node);
}

/**
 * Bind the main process APIs to the window.
 * If a new main process API is created then add it to this method.
 */
async function bindMainApis() {
  return {
    utilApi: await bindMainApi<UtilApi>("UtilApi"),
    projectApi: await bindMainApi<ProjectApi>("ProjectApi"),
    commandApi: await bindMainApi<CommandApi>("CommandApi"),
    graphApi: await bindMainApi<GraphApi>("GraphApi"),
    toolboxApi: await bindMainApi<ToolboxApi>("ToolboxApi"),
  };
}

/**
 * Exposes the window APIs to the main process.
 * If a new window API is created then add it to this method.
 */
function exposeWindowApis() {
  exposeWindowApi(new CommandRegistryApi());
  exposeWindowApi(new ClientGraphApi());
  exposeWindowApi(new ClientProjectApi());
}

export type MainApis = AwaitedType<typeof bindMainApis>;
