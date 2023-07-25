import { type UUID } from "../../shared/utils/UniqueEntity";
import { type NodeSignature } from "./ToolboxTypes";
import { type Writable, writable, get } from "svelte/store";

export type GraphUUID = UUID;
export type GraphNodeUUID = UUID;
export type GraphAnchorUUID = UUID;

export class UIGraph {
  public nodes: { [key: GraphNodeUUID]: GraphNode } = {};
  public edges: { [key: GraphUUID]: any } = {}; // TODO

  constructor(public uuid: GraphUUID) {}

  public updateNodes() {}
}

export class GraphNode {
  displayName = "";
  id = "";

  signature: NodeSignature = ""; // index in toolbox

  styling?: NodeStylingStore;

  inputUIValues: AnchorValueStore;

  // inAnchors: GraphAnchor[] = [];
  // outAnchors: GraphAnchor[] = [];

  constructor(public uuid: GraphNodeUUID, pos?: SvelvetCanvasPos) {
    this.id = uuid;
    this.displayName = "Node-" + uuid.substring(0, 6);
    if (pos) {
      this.styling = new NodeStylingStore();
      this.styling.pos.set(pos);
    }
    this.inputUIValues = new AnchorValueStore();
  }
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
