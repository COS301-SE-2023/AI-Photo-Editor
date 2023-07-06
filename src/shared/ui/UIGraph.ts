import { type UUID } from "@shared/utils/UniqueEntity";
import { type NodeSignature } from "./ToolboxTypes";
import { type Writable, writable, get } from "svelte/store";

export type GraphUUID = UUID;
export type GraphNodeUUID = UUID;
export type GraphAnchorUUID = UUID;

export class UIGraph {
  public nodes: { [key: GraphNodeUUID]: GraphNode } = {};
  public edges: { [key: GraphUUID]: any } = {}; // TODO

  constructor(public uuid: GraphUUID) {}
}

export class GraphNode {
  displayName = "";
  id = "";

  signature: NodeSignature = ""; // index in toolbox

  // inAnchors: GraphAnchor[] = [];
  // outAnchors: GraphAnchor[] = [];

  styling: StorableNodeStyling;

  constructor(public uuid: GraphNodeUUID) {
    this.id = uuid;
    this.displayName = "Node-" + uuid.substring(0, 6);
    this.styling = new StorableNodeStyling();
  }
}

export function activateStorable<T>(storable: Storable<T>) {
  console.log("ACTIVATE", storable);
  if (!storable.isStore) {
    storable.value = writable<T>(storable.value as T);
    storable.isStore = true;
  }
  return storable;
}

// A class for representing serializable data on the backend
// while still offering reactivity on the frontend
export class Storable<T> implements Writable<T> {
  public isStore = false;
  public value: Writable<T> | T;

  public get set() {
    return (<Writable<T>>this.value).set;
  }

  public get update() {
    return (<Writable<T>>this.value).update;
  }

  public get subscribe() {
    return (<Writable<T>>this.value).subscribe;
  }

  constructor(value: T) {
    this.value = value;
    this.isStore = false;
  }
}

export class StorableNodeStyling {
  pos = new Storable<{ x: number; y: number }>({ x: 0, y: 0 });
  width = new Storable<number>(0);
  height = new Storable<number>(0);
}

class GraphAnchor {
  constructor(public uuid: GraphAnchorUUID, public type: string) {}
}
