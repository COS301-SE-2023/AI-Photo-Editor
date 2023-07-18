import { graphMall } from "./stores/GraphStore";
import { blixStore } from "./stores/BlixStore";
import { commandStore } from "./stores/CommandStore";
import { initializeAPIs } from "./api/apiInitializer";
import { GraphNode, UIGraph } from "@shared/ui/UIGraph";
import { toolboxStore } from "./stores/ToolboxStore";
/**
 * Runs on app start. Will initialize the IPC APIs and set
 * the initial frontend stores.
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
  const command = await window.apis.commandApi.getCommands();
  commandStore.refreshStore(command);

  // Toolbox store
  const node = await window.apis.toolboxApi.getNodes();
  toolboxStore.refreshStore(node);

  // Graph store
  const allGraphIds = await window.apis.graphApi.getAllGraphUUIDs();
  // console.log("ALL GRAPHS", allGraphIds);

  for (const graphId of allGraphIds) {
    const graph = await window.apis.graphApi.getGraph(graphId);
    // console.log("BACKEND GRAPH", graph.getNodes);

    // TODO: REMOVE; This is just for testing
    const uiGraph = new UIGraph(graphId);
    const node1 = new GraphNode("1");
    const node2 = new GraphNode("2");
    const node3 = new GraphNode("a");
    uiGraph.nodes[node1.uuid] = node1;
    uiGraph.nodes[node2.uuid] = node2;
    uiGraph.nodes[node3.uuid] = node3;
    // node1.styling.pos.set({ x: 100, y: 100 });

    graphMall.refreshGraph(uiGraph.uuid, uiGraph);
  }
}
