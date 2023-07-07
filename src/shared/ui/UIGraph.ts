import { type UUID } from "@shared/utils/UniqueEntity";
import { type NodeSignature } from "./ToolboxTypes";
import { type Writable, writable, get } from "svelte/store";

export type GraphUUID = UUID;
export type GraphNodeUUID = UUID;
export type GraphAnchorUUID = UUID;

export class UIGraph {
  public storify() {
    for (const nodeUUID in this.nodes) {
      const node = this.nodes[nodeUUID];
    }
  }

  public nodes: { [key: GraphNodeUUID]: GraphNode } = {};
  public edges: { [key: GraphUUID]: any } = {}; // TODO

  constructor(public uuid: GraphUUID) {}
}

export class GraphNode {
  displayName = "";
  id = "";

  signature: NodeSignature = ""; // index in toolbox

  styling?: NodeStylingStore;

  // inAnchors: GraphAnchor[] = [];
  // outAnchors: GraphAnchor[] = [];

  constructor(public uuid: GraphNodeUUID) {
    this.id = uuid;
    this.displayName = "Node-" + uuid.substring(0, 6);
  }
}

export class NodeStylingStore {
  pos = writable<{ x: number; y: number }>({ x: 0, y: 0 });
  width = writable<number>(0);
  height = writable<number>(0);
}

class GraphAnchor {
  constructor(public uuid: GraphAnchorUUID, public type: string) {}
}
