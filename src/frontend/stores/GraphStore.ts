import { type UUID } from "@shared/utils/UniqueEntity";
import { writable, type Unsubscriber } from "svelte/store";
import type { Connections } from "svelvet";

function createGraphStore(graphUUID: GraphUUID) {
  const { subscribe, update, set } = writable<UIGraph>(new UIGraph(graphUUID));

  // Called by CoreGraphApi when the command registry changes
  function refreshStore(newGraph: UIGraph) {
    set(newGraph);
  }

  async function addEdge() {
    // TODO
    const res = await window.apis.graphApi.addEdge("");
    return false;
  }

  async function addNode() {
    const res = await window.apis.graphApi.addNode("");

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

  async function removeEdge() {
    const res = await window.apis.graphApi.removeEdge("");
    return false;
  }
  async function removeNode() {
    const res = await window.apis.graphApi.removeNode("");
    return false;
  }

  return new GraphStore(subscribe, addEdge, addNode, removeEdge, removeNode, refreshStore);
}

// TODO: Return a GraphStore in createGraphStore for typing
class GraphStore {
  constructor(
    public subscribe: (...anything: any) => Unsubscriber,
    public addEdge: () => Promise<boolean>,
    public addNode: () => Promise<boolean>,
    public removeEdge: () => Promise<boolean>,
    public removeNode: () => Promise<boolean>,
    public refreshStore: (newGraph: UIGraph) => void
  ) {}
}

type GraphUUID = UUID;
type GraphNodeUUID = UUID;
type GraphAnchorUUID = UUID;

export class UIGraph {
  nodes: GraphNode[] = [];

  constructor(public uuid: GraphUUID) {}
}

export class GraphNode {
  name = "";
  public connections: Connections;

  nodeUI: any; // TODO: Change this to NodeUI

  inAnchors: GraphAnchor[] = [];
  outAnchors: GraphAnchor[] = [];

  pos: { x: number; y: number } = { x: 0, y: 0 };
  dims: { w: number; h: number } = { w: 0, h: 0 };

  constructor(public uuid: GraphNodeUUID) {
    this.name = "Node-" + uuid;
    this.connections = [];
  }
}

class GraphAnchor {
  constructor(public uuid: GraphAnchorUUID, public type: string) {}
}

// The public area with all the cool stores 😎
class GraphMall {
  private graphStores: { [key: GraphUUID]: GraphStore };

  constructor() {
    this.graphStores = {
      // default: createGraphStore("default"),
    };

    // const temp = new UIGraph();
    // const node1 = new GraphNode("1");
    // const node2 = new GraphNode("2");
    // const node3 = new GraphNode("3");

    // temp.nodes.push(node1);
    // temp.nodes.push(node2);
    // temp.nodes.push(node3);

    // node1.pos.x = 100;
    // node1.pos.y = 100;

    // node2.pos.x = -100;
    // node2.pos.y = -100;

    // node3.pos.x = 50;
    // node3.dims.w = 100;

    // node1.connections.push(["1", "2"]);
    // node2.connections.push(["2", "1"]);

    // this.graphStores.default.refreshStore(temp);
  }

  public refreshGraph(graphUUID: GraphUUID, newGraph: UIGraph) {
    if (!this.graphStores[graphUUID]) {
      this.graphStores[graphUUID] = createGraphStore(graphUUID);
    }

    this.graphStores[graphUUID].refreshStore(newGraph);
  }

  public getGraph(graphUUID: GraphUUID): GraphStore {
    return this.graphStores[graphUUID];
  }
}

export const graphMall = writable<GraphMall>(new GraphMall());
