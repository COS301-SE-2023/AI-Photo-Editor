import { writable } from "svelte/store";
import { commandStore } from "./CommandStore";
import { toolboxStore } from "./ToolboxStore";
import { tileStore } from "./TileStore";
import { shortcutsRegistry } from "./ShortcutStore";

interface BlixStore {
  blixReady: boolean;
  systemInfo: {
    nodeVersion: string;
    systemPlatform: string;
    systemType: string;
    systemVersion: string;
  };
}

// Currently used to store some startup config. Can potentially be used to store
// some other global state in the future.
export const blixStore = writable<BlixStore>({
  blixReady: false,
  systemInfo: {
    nodeVersion: "",
    systemPlatform: "",
    systemType: "",
    systemVersion: "",
  },
});

export async function setInitialStores() {
  // BLix store
  const res = await window.apis.utilApi.getSystemInfo();
  blixStore.update((state) => ({ ...state, systemInfo: res }));

  // Command store
  const command = await window.apis.commandApi.getCommands();
  commandStore.refreshStore(command);

  // Toolbox store
  const node = await window.apis.toolboxApi.getNodes();
  toolboxStore.refreshStore(node);

  // Tile store
  const tile = await window.apis.tileApi.getTiles();
  tileStore.refreshStore(tile);

  const shortcuts = await window.apis.utilApi.getUserSettings();
  if (shortcuts.status === "success") shortcutsRegistry.refreshStore(shortcuts.data);

  // Graph store
  // const allGraphIds = await window.apis.graphApi.getAllGraphUUIDs();
  // console.log("ALL GRAPHS", allGraphIds);

  // for (const graphId of allGraphIds) {
  //   const graph = await window.apis.graphApi.getGraph(graphId);
  // console.log("BACKEND GRAPH", graph.getNodes);

  // TODO: REMOVE; This is just for testing
  // const uiGraph = new UIGraph(graphId);
  // const node1 = new GraphNode("1");
  // const node2 = new GraphNode("2");
  // const node3 = new GraphNode("a");
  // uiGraph.nodes[node1.uuid] = node1;
  // uiGraph.nodes[node2.uuid] = node2;
  // uiGraph.nodes[node3.uuid] = node3;
  // node1.pos.x = 100;
  // node1.pos.y = 100;

  // graphMall.refreshGraph(uiGraph.uuid, uiGraph);
  // }
  // exportLayout()
}
