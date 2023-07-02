import { type UUID } from "@shared/utils/UniqueEntity";

export type GraphUUID = UUID;
export type GraphNodeUUID = UUID;
export type GraphAnchorUUID = UUID;

export class UIGraph {
  public nodes: { [key: GraphNodeUUID]: GraphNode } = {};
  public edges: { [key: GraphUUID]: any } = {}; // TODO

  constructor(public uuid: GraphUUID) {}
}

export class GraphNode {
  name = "";
  id = "";
  public connections: [];

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
