import { blixStore } from "./stores/BlixStore";
import { commandStore } from "./stores/CommandStore";
import { GraphNode, UIGraph, graphMall } from "./stores/GraphStore";
import { initializeAPIs } from "api/apiInitializer";
import { projectManager } from "./stores/ProjectStore";
import type { CommonProject } from "@shared/types";
/**
 * Runs on app start. Will initialize the IPC APIs and set the initial frontend
 * stores.
 */
export async function init() {
  await initializeAPIs();
  await setInitialStores();
}

async function setInitialStores() {
  // ===== SET INITIAL STORE VALUES ===== //

  // BLix store
  const res = await window.apis.utilApi.getSystemInfo();
  blixStore.set({ systemInfo: res });

  // Command store
  const command = await window.apis.pluginApi.getCommands();
  commandStore.refreshStore(command);

  // Project store
  const projects = await window.apis.projectApi.getRecentProjects();
  for (const p of projects.data) {
    projectManager.loadProject(p);
  }

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
