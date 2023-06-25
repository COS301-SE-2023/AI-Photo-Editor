import { bindMainApi, exposeWindowApi } from "electron-affinity/window";
import type { AwaitedType } from "electron-affinity/window";
import { blixStore } from "./stores/BlixStore";
import { commandStore } from "./stores/CommandStore";
import { GraphNode, UIGraph, graphMall } from "./stores/GraphStore";

// Main APIs
import type { UtilApi } from "../electron/lib/api/UtilApi";
import type { ProjectApi } from "../electron/lib/api/ProjectApi";
import type { PluginApi } from "../electron/lib/api/PluginApi";
import type { GraphApi } from "../electron/lib/api/GraphApi";

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

  // ===== SET INITIAL STORE VALUES ===== //

  // Command store
  const command = await window.apis.pluginApi.getCommands();
  blixStore.set({ systemInfo: res });
  commandStore.refreshStore(command);

  // Graph store
  const allGraphIds = await window.apis.graphApi.getAllGraphUUIDs();
  for (const graphId of allGraphIds) {
    const graph = await window.apis.graphApi.getGraph(graphId);

    // TODO: REMOVE; This is just for testing
    const uiGraph = new UIGraph(graphId);
    const node1 = new GraphNode("1");
    const node2 = new GraphNode("2");
    uiGraph.nodes.push(node1);
    uiGraph.nodes.push(node2);
    node1.pos.x = 100;
    node1.pos.y = 100;

    graphMall.update((mall) => {
      // Only update the graph that has changed
      mall.refreshGraph(graph.uuid, uiGraph);

      return mall;
    });
  }
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
}

export type MainApis = AwaitedType<typeof bindMainApis>;
