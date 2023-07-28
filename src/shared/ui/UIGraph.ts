import { type UUID } from "../../shared/utils/UniqueEntity";
import { type NodeSignature } from "./ToolboxTypes";
import { type Writable, writable, get } from "svelte/store";

export type GraphUUID = UUID;
export type GraphNodeUUID = UUID;
export type GraphEdgeUUID = UUID;
export type GraphAnchorUUID = UUID;

export class UIGraph {
  public displayName;
  public nodes: { [key: GraphNodeUUID]: GraphNode } = {};
  public edges: { [key: GraphAnchorUUID]: GraphEdge } = {};

  constructor(public uuid: GraphUUID) {
    this.displayName = "Graph-" + uuid.substring(0, 6);
  }

  public updateNodes() {}
}

export class GraphNode {
  displayName = "";

  signature: NodeSignature = ""; // index in toolbox

  styling?: NodeStylingStore;

  inputUIValues: AnchorValueStore;

  // inAnchors: GraphAnchor[] = [];
  // outAnchors: GraphAnchor[] = [];

  // Maps toolbox anchor id's (local to node) to their backend UUIDs (global in graph)
  anchorUUIDs: { [key: string]: GraphAnchorUUID } = {};

  constructor(public readonly uuid: GraphNodeUUID, pos?: SvelvetCanvasPos) {
    this.displayName = "Node-" + uuid.substring(0, 6);
    if (pos) {
      this.styling = new NodeStylingStore();
      this.styling.pos.set(pos);
    }
    this.inputUIValues = new AnchorValueStore();
  }
}

export class GraphEdge {
  label = "";

  constructor(
    public readonly uuid: GraphEdgeUUID,
    readonly nodeUUIDFrom: GraphNodeUUID,
    readonly nodeUUIDTo: GraphNodeUUID,
    readonly anchorIdFrom: GraphAnchorUUID,
    readonly anchorIdTo: GraphAnchorUUID
  ) {}
}

export type SvelvetCanvasPos = { x: number; y: number };

export class NodeStylingStore {
  pos = writable<SvelvetCanvasPos>({ x: 0, y: 0 });
  width = writable<number>(0);
  height = writable<number>(0);
}

export class AnchorValueStore {
  inputs: { [key: string]: Writable<any> } = {};
}

class GraphAnchor {
  constructor(public uuid: GraphAnchorUUID, public type: string) {}
}
