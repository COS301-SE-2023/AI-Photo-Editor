import crypto from "crypto";
import { CoreGraphSubscriber } from "./GraphSubscriber";
import logger from "../../utils/logger";
import {
  AnchorType,
  InputAnchorInstance,
  NodeInstance,
  OutputAnchorInstance,
} from "./ToolboxRegistry";
import { Output } from "clean-css";

export type UUID = string;
export type AnchorUUID = UUID;

class UniqueEntity {
  private uuid: UUID;

  constructor() {
    this.uuid = UniqueEntity.genUUID();
  }
  public get getUUID() {
    return this.uuid;
  }

  // 64-bit hex string (length 32 chars)
  private static genUUID(): UUID {
    // 1% chance of collision after 83 million years at 1 hash/ms 🫨
    return crypto.randomBytes(32).toString("hex");
  }
}

// Stores all the core graph representations in the current project
export class CoreGraphStore extends UniqueEntity {
  constructor(private graphs: { [key: UUID]: CoreGraph }) {
    super();
  }

  public createGraph(): UUID {
    const newGraph: CoreGraph = new CoreGraph();
    this.graphs[newGraph.getUUID] = newGraph;

    return newGraph.getUUID;
  }
}

// Effectively the "database" that we query to
// Acts as a 'publisher' for each 'subscriber' module

// Testting done in index.ts
export class CoreGraph extends UniqueEntity {
  private nodes: { [key: UUID]: Node };
  private anchors: { [key: UUID]: Anchor };
  private edgeDest: { [key: AnchorUUID]: Edge };
  private edgeSrc: { [key: AnchorUUID]: AnchorUUID };

  private subscribers: CoreGraphSubscriber[];

  constructor() {
    super();
    this.nodes = {};
    this.anchors = {};
    this.edgeDest = {};
    this.edgeSrc = {};
  }

  public get getNodes() {
    return this.nodes;
  }

  public get getAnchors() {
    return this.anchors;
  }

  public get getEdgeDest() {
    return this.edgeDest;
  }

  // We need to pass in node name and plugin name
  public addNode(node: NodeInstance) {
    // Create New Node
    const n: Node = new Node(
      node.getSignature.split("/")[1],
      node.getSignature.split("/")[0],
      node.getInputAnchorInstances,
      node.getOutputAnchorInstances
    );
    // Add Node to Graph
    this.nodes[n.getUUID] = n;
    // Add Nodes's Anchors to Graph
    for (const anchor in n.getAnchors) {
      if (!n.getAnchors.hasOwnProperty(anchor)) continue;
      this.anchors[anchor] = n.getAnchors[anchor];
    }
  }

  public addEdge(anchorFrom: UUID, anchorTo: UUID) {
    const ancFrom = this.anchors[anchorFrom];
    const ancTo = this.anchors[anchorTo];

    // Edge must flow from output anchor to input anchor
    if (ancFrom.getIOType !== AnchorIO.output || ancTo.getIOType !== AnchorIO.input) {
      return false;
    }

    // Data flowing through edge must be of same type for both anchors
    if (ancFrom.getType !== ancTo.getType) {
      return false;
    }

    // Check for cycles
    if (this.checkForCycles(ancFrom, ancTo)) {
      return false;
    }

    // Check for duplicate edgeDest
    if (this.checkForDuplicateEdges(ancFrom, ancTo)) {
      return false;
    }

    // Add edge to graph
    // Store edge at UUID of anchor it flows into
    const edge: Edge = new Edge(anchorFrom, anchorTo);
    this.edgeDest[ancTo.getUUID] = edge;
    this.edgeSrc[ancFrom.getUUID] = ancTo.getUUID;

    return true;
  }

  private checkForDuplicateEdges(ancFrom: Anchor, ancTo: Anchor): boolean {
    // TODO
    return false;
  }

  private checkForCycles(ancFrom: Anchor, ancTo: Anchor): boolean {
    const curr: Node = ancFrom.getParent;
    // For each anchor in the current node
    for (const anchor in curr.getAnchors) {
      // Only check input anchors
      if (this.anchors[anchor].getIOType !== AnchorIO.output) {
        // If edge anchfor To currently exists in current node anchors then there is a cycle
        if (ancTo.getUUID in curr.getAnchors) {
          return true;
        }
        // If edge exists from input anchor of node
        if (anchor in this.edgeDest) {
          return this.checkForCycles(this.anchors[this.edgeDest[anchor].getAnchorFrom], ancTo);
        }
      }
    }

    return false;
  }

  public removeNode(anchorTo: AnchorUUID) {
    // TODO
  }

  public removeEdge(edge: UUID): boolean {
    try {
      delete this.edgeDest[edge];
      delete this.edgeSrc[edge];
      return true;
    } catch (error) {
      return false;
    }
  }

  private copy() {
    // TODO
  }

  public subscribe() {
    // TODO
  }

  public unsubscribe() {
    // TODO
  }

  public printGraph() {
    for (const edge in this.edgeDest) {
      if (!this.edgeDest.hasOwnProperty(edge)) continue;
      logger.info("Edge (same as anchorTo): " + edge);
      logger.info(
        "Node From: " + this.anchors[this.edgeDest[edge].getAnchorFrom].getParent.getUUID
      );
      logger.info("Node To: " + this.anchors[this.edgeDest[edge].getAnchorTo].getParent.getUUID);
      logger.info("Anchor from -> Anchor to:");
      logger.info(
        this.anchors[this.edgeDest[edge].getAnchorFrom].getUUID +
          " -> " +
          this.anchors[this.edgeDest[edge].getAnchorTo].getUUID +
          "\n"
      );
    }
  }
}

// This Node representation effectively 'stands-in'
// as a reference to the plugin's functional implementation.
// When we interpret the graph we dereference back to the plugin
class Node extends UniqueEntity {
  private anchors: { [key: string]: Anchor };
  private styling: NodeStyling;

  constructor(
    private name: string, // The name id of the node in the plugin
    private plugin: string, // The name id of the plugin that defined the node
    private inputAnchors: InputAnchorInstance[], // Input anchors attatched to node
    private outputAnchors: OutputAnchorInstance[] // Output anchors attatched to node
  ) {
    super();
    this.anchors = {};

    inputAnchors.forEach((anchor) => {
      const anc = new Anchor(this, AnchorIO.input, anchor.type, anchor.displayName);
      this.anchors[anc.getUUID] = anc;
    });
    outputAnchors.forEach((anchor) => {
      const anc = new Anchor(this, AnchorIO.output, anchor.type, anchor.displayName);
      this.anchors[anc.getUUID] = anc;
    });
  }

  public get getAnchors() {
    return this.anchors;
  }

  public get getName() {
    return this.name;
  }

  // public printNode() {
  //   logger.info(`${this.inputAnchors.length} :${this.name}: ${this.outputAnchors.length}\n`)
  // }
}

enum AnchorIO {
  input,
  output,
}

class Anchor extends UniqueEntity {
  constructor(
    private parent: Node,
    private ioType: AnchorIO,
    private type: AnchorType,
    private displayName: string
  ) {
    super();
  }

  get getParent() {
    return this.parent;
  }

  get getIOType() {
    return this.ioType;
  }

  get getType() {
    return this.type;
  }

  get getDisplayName() {
    return this.displayName;
  }
}

class Edge extends UniqueEntity {
  constructor(private anchorFrom: UUID, private anchorTo: UUID) {
    super();
  }

  public get getAnchorFrom() {
    return this.anchorFrom;
  }

  public get getAnchorTo() {
    return this.anchorTo;
  }
}

class NodeStyling {
  constructor(private position: { x: number; y: number }, private size: { w: number; h: number }) {}
}
