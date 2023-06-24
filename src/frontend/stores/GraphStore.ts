import { writable, type Unsubscriber } from "svelte/store";
import type { Connections } from "svelvet";

function createGraphStore() {
  const temp = new Graph();
  const node1 = new GraphNode("1");
  const node2 = new GraphNode("2");
  const node3 = new GraphNode("3");

  temp.nodes.push(node1);
  temp.nodes.push(node2);
  temp.nodes.push(node3);

  node1.pos.x = 100;
  node1.pos.y = 100;

  node2.pos.x = -100;
  node2.pos.y = -100;

  node3.pos.x = 50;
  node3.dims.w = 100;

  node1.connections.push(["1", "2"]);
  node2.connections.push(["2", "1"]);

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
    public subscribe: (...anything: any) => Unsubscriber,
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
  public connections: Connections;

  nodeUI: any; // TODO: Change this to NodeUI

  inAnchors: GraphAnchor[] = [];
  outAnchors: GraphAnchor[] = [];

  pos: { x: number; y: number } = { x: 0, y: 0 };
  dims: { w: number; h: number } = { w: 0, h: 0 };

  constructor(public id: GraphNodeId) {
    this.name = "Node-" + id;
    this.connections = [];
  }
}

class GraphAnchor {
  constructor(public id: GraphAnchorId, public type: string) {}
}

export const graphStores: { [key: GraphId]: GraphStore } = {
  default: createGraphStore(),
};
