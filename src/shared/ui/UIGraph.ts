import type { UIValue } from "../../shared/types";
import { type UUID } from "../../shared/utils/UniqueEntity";
import { type NodeSignature } from "./ToolboxTypes";
import { type Writable, writable } from "svelte/store";
import type { NodeUI, UIComponentConfig } from "./NodeUITypes";
import type { NodeUILeaf } from "./NodeUITypes";

export type GraphUUID = UUID;
export type GraphNodeUUID = UUID;
export type GraphEdgeUUID = UUID;
export type GraphAnchorUUID = UUID;
export type GraphMetadata = {
  displayName: string;
};

export class UIGraph {
  public nodes: { [key: GraphNodeUUID]: GraphNode } = {};
  public edges: { [key: GraphAnchorUUID]: GraphEdge } = {};
  public metadata: GraphMetadata = {
    displayName: "Graph",
  };

  constructor(public uuid: GraphUUID) {}

  public updateNodes() {}
}

export class GraphNode {
  displayName = "";

  signature: NodeSignature = ""; // index in toolbox

  styling?: NodeStylingStore;

  inputUIValues: UIValueStore;

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
    this.inputUIValues = new UIValueStore();
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

export class UIValueStore {
  inputs: { [key: string]: Writable<UIValue> } = {};
}

export function constructUIValueStore(ui: NodeUI, uiConfigs: { [key: string]: UIComponentConfig }) {
  let res = new UIValueStore();
  if (ui.type === "parent") {
    for (const child of ui.params) {
      res = { ...res, ...constructUIValueStore(child, uiConfigs) };
    }
  } else if (ui.type === "leaf") {
    const leaf = ui as NodeUILeaf;
    res.inputs[ui.label] = writable<UIValue>(uiConfigs[leaf.label].defaultValue);
  }

  return res;
}

export class GraphAnchor {
  constructor(public uuid: GraphAnchorUUID, public type: string) {}
}
