import { writable, type Unsubscriber } from "svelte/store";

function createGraphStore() {
  const temp = new Graph();
  temp.nodes.push(new GraphNode("1"));
  temp.nodes.push(new GraphNode("2"));
  temp.nodes.push(new GraphNode("3"));

  const { subscribe, update } = writable<Graph>(temp);

  // TODO: Implement IPC subscription
  // let ipcConnected = false;

  // function tryConnectIPC() {
  //   if (ipcConnected) return;

  //   TODO: Set up Typescript to properly identify window.api
  //   See: [https://stackoverflow.com/a/71078436]
  //   if ("api" in window && window.api.commandRegistry) {
  //     window.api.commandRegistry("registryChanged", null, refreshStore);
  //   }
  // }

  // Called when the command registry changes
  // Automatically updates the value of the store
  // function refreshStore(results: any) {
  //   tryConnectIPC();

  //   subscribe();
  //   set([]);
  // }

  function addEdge() {
    return false;
  }
  function addNode() {
    // TODO: Implement properly, just for testing atm
    update((graph) => {
      const newNode = new GraphNode(Math.round(10000 * Math.random()).toString());
      newNode.pos.x = Math.round(1000 * Math.random());
      newNode.pos.y = Math.round(1000 * Math.random());
      newNode.dims.h = Math.round(100 + 200 * Math.random());
      graph.nodes.push(newNode);
      return graph;
    });

    return true;
  }

  function removeEdge() {
    return false;
  }
  function removeNode() {
    return false;
  }

  return {
    subscribe,
    addEdge,
    addNode,
    removeEdge,
    removeNode,
  };
}

// TODO: Return a GraphStore in createGraphStore for typing
class GraphStore {
  constructor(
    public subscribe: (...anything: any) => Unsubscriber, // TODO: Probably fix typing
    public addEdge: () => boolean,
    public addNode: () => boolean,
    public removeEdge: () => boolean,
    public removeNode: () => boolean
  ) {}
}

type GraphId = string;
type GraphNodeId = string;
type GraphAnchorId = string;

export class Graph {
  nodes: GraphNode[] = [];
}

export class GraphNode {
  name = "";

  inAnchors: GraphAnchor[] = [];
  outAnchors: GraphAnchor[] = [];

  pos: { x: number; y: number } = { x: 0, y: 0 };
  dims: { w: number; h: number } = { w: 0, h: 0 };

  constructor(public id: GraphNodeId) {}
}

class GraphAnchor {
  constructor(public id: GraphAnchorId, public type: string) {}
}

export const graphStores: { [key: GraphId]: GraphStore } = {
  default: createGraphStore(),
};
