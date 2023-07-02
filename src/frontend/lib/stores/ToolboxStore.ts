import { writable } from "svelte/store";
import type { INode } from "../../../shared/types/index";
import type { NodeUI } from "@electron/lib/registries/ToolboxRegistry";

interface NodeStore {
  nodes: INode[];
}

function createNodeStore() {
  const { subscribe, set } = writable<NodeStore>({
    nodes: [],
  });

  // Called when the command registry changes
  // Automatically updates the value of the store
  function refreshStore(results: INode[]) {
    set({ nodes: results });
  }

  return {
    subscribe,
    // addCommands,
    // runCommand,
    refreshStore,
  };
}

export const nodeStore = createNodeStore();

type NodeSignature = string;
type ToolboxDict = { [key: NodeSignature]: NodeUI };

class ToolboxStore {
  store = writable<ToolboxDict>({});

  public refreshToolbox() {
    // this.store.update((stores) => {
    //   if (!stores[graphUUID]) {
    //     stores[graphUUID] = new GraphStore(graphUUID);
    //   }
    //   stores[graphUUID].refreshStore(newGraph);
    //   return stores;
    // });
    // const val = get(this.store);
  }

  public get subscribe() {
    return this.store.subscribe;
  }

  // Returns a derived store containing only the graph UUIDs
  // public getAllGraphUUIDsReactive() {
  //   return derived(this.store, (mall) => {
  //     return Object.keys(mall);
  //   });
  // }
}

// export const graphMall = writable<GraphMall>(new GraphMall());
export const graphMall = new ToolboxStore();
