import { type UUID } from "@shared/utils/UniqueEntity";
import { writable, type Unsubscriber, get, derived, type Writable } from "svelte/store";

// When the the CoreGraphApi type has to be imported into the backend
// (WindowApi.ts) so that the API can be bound then it tries to import the type
// below because the GraphStore gets used in the CoreGraphApi (its like one long
// type dependency chain), this seems to cause some sort of duplicate export
// issue originating from the svelvet node files when it tries to check the
// types at compile time: node_modules/svelvet/dist/types/index.d.ts:4:1 - error
// TS2308: Module './general' has already exported a member named
// 'ActiveIntervals'. Consider explicitly re-exporting to resolve the ambiguity.

// Not sure how to solve this at the moment, so had to add a temp fix below
// unfortunately because of time constraints.

// import type { Connections } from "svelvet";
type Connections = (string | number | [string | number, string | number] | null)[];

// TODO: Return a GraphStore in createGraphStore for typing
class GraphStore {
  graphStore: Writable<UIGraph>;

  constructor(public uuid: GraphUUID) {
    this.graphStore = writable<UIGraph>(new UIGraph(uuid));
  }

  // Called by CoreGraphApi when the command registry changes
  public refreshStore(newGraph: UIGraph) {
    this.graphStore.set(newGraph);
  }

  async addEdge() {
    // TODO
    const res = await window.apis.graphApi.addEdge("");
    return false;
  }

  async addNode() {
    const res = await window.apis.graphApi.addNode("");

    // TODO: Implement properly, just for testing atm
    this.graphStore.update((graph) => {
      const newNode = new GraphNode(Math.round(10000 * Math.random()).toString());
      newNode.pos.x = Math.round(1000 * Math.random());
      newNode.pos.y = Math.round(1000 * Math.random());
      newNode.dims.h = Math.round(100 + 200 * Math.random());
      graph.nodes[newNode.uuid] = newNode;
      return graph;
    });

    return true;
  }

  public get update() {
    return this.graphStore.update;
  }

  public get subscribe() {
    return this.graphStore.subscribe;
  }

  public getNodesReactive() {
    return derived(this.graphStore, (graph) => {
      return Object.values(graph.nodes);
    });
  }

  async removeEdge() {
    const res = await window.apis.graphApi.removeEdge("");
    return false;
  }
  async removeNode() {
    const res = await window.apis.graphApi.removeNode("");
    return false;
  }

  async setNodePos(nodeId: string, pos: { x: number; y: number }) {
    const res = await window.apis.graphApi.setNodePos("");

    this.graphStore.update((graph) => {
      if (!graph.nodes[nodeId]) return graph;

      graph.nodes[nodeId].pos = pos;
      graph.nodes[nodeId] = graph.nodes[nodeId];
      return graph;
    });
    return false;
  }
}

export type GraphUUID = UUID;
type GraphNodeUUID = UUID;
type GraphAnchorUUID = UUID;

export class UIGraph {
  nodes: { [key: GraphNodeUUID]: GraphNode } = {};

  constructor(public uuid: GraphUUID) {}
}

export class GraphNode {
  name = "";
  id = "";
  public connections: Connections;

  nodeUI: any; // TODO: Change this to NodeUI

  inAnchors: GraphAnchor[] = [];
  outAnchors: GraphAnchor[] = [];

  pos: { x: number; y: number } = { x: 0, y: 0 };
  dims: { w: number; h: number } = { w: 0, h: 0 };

  constructor(public uuid: GraphNodeUUID) {
    this.id = uuid;
    this.name = "Node-" + uuid;
    this.connections = [];
  }
}

class GraphAnchor {
  constructor(public uuid: GraphAnchorUUID, public type: string) {}
}

type GraphDict = { [key: GraphUUID]: GraphStore };

// The public area with all the cool stores 😎
class GraphMall {
  mall = writable<GraphDict>({});

  public refreshGraph(graphUUID: GraphUUID, newGraph: UIGraph) {
    this.mall.update((stores) => {
      if (!stores[graphUUID]) {
        stores[graphUUID] = new GraphStore(graphUUID);
      }
      stores[graphUUID].refreshStore(newGraph);
      return stores;
    });

    const val = get(this.mall);
  }

  public get subscribe() {
    return this.mall.subscribe;
  }

  // Returns a derived store containing only the graph UUIDs
  public getAllGraphUUIDsReactive() {
    return derived(this.mall, (mall) => {
      return Object.keys(mall);
    });
  }

  public getAllGraphUUIDs(): GraphUUID[] {
    return Object.keys(get(this.mall)).map((uuid) => uuid);
  }

  // Returns a derived store containing only the specified graph
  public getGraphReactive(graphUUID: GraphUUID) {
    return derived(this.mall, (mall) => {
      if (!mall[graphUUID]) return null;
      return mall[graphUUID];
    });
  }

  // Returns the store for the specified graph
  public getGraph(graphUUID: GraphUUID): GraphStore {
    return get(this.mall)[graphUUID];
  }

  // Returns the internal once-off state of the specified graph
  public getGraphState(graphUUID: GraphUUID): UIGraph {
    return get(this.getGraph(graphUUID));
  }

  public getNode(graphUUID: GraphUUID, nodeUUID: GraphNodeUUID): GraphNode {
    return get(get(this.mall)[graphUUID]).nodes[nodeUUID];
  }

  public updateNode(
    graphUUID: GraphUUID,
    nodeUUID: GraphNodeUUID,
    func: (node: GraphNode) => GraphNode
  ) {
    this.mall.update((mall) => {
      if (!mall[graphUUID]) return mall;

      mall[graphUUID].update((graph) => {
        if (!graph.nodes[nodeUUID]) return graph;

        graph.nodes[nodeUUID] = func(graph.nodes[nodeUUID]);
        return graph;
      });

      return mall;
    });
  }
}

// export const graphMall = writable<GraphMall>(new GraphMall());
export const graphMall = new GraphMall();
