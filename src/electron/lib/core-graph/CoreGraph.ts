import logger from "../../utils/logger";
import { type UUID, UniqueEntity } from "../../../shared/utils/UniqueEntity";
import type { CoreGraphSubscriber } from "./CoreGraphInteractors";
import type {
  AnchorType,
  InputAnchorInstance,
  NodeInstance,
  OutputAnchorInstance,
} from "../registries/ToolboxRegistry";
import { get } from "http";

// =========================================
// Explicit types for type safety
// =========================================

export type AnchorUUID = UUID;

// =========================================
// Stores all the core graph representations in the current project
export class CoreGraphStore extends UniqueEntity {
  constructor(private graphs: { [key: UUID]: CoreGraph }) {
    super();
  }

  public createGraph(): UUID {
    const newGraph: CoreGraph = new CoreGraph();
    this.graphs[newGraph.uuid] = newGraph;

    return newGraph.uuid;
  }
}

// Effectively the "database" that we query to
// Acts as a 'publisher' for each 'subscriber' module

// Testting done in index.ts
export class CoreGraph extends UniqueEntity {
  private nodes: { [key: UUID]: Node };
  // private nodeList: UUID[]; // Each node when added will receive an index that is used to reference the node in an ordered fashion
  private anchors: { [key: UUID]: Anchor };
  private edgeDest: { [key: AnchorUUID]: Edge }; // Map a destination anchor to an edge
  private edgeSrc: { [key: AnchorUUID]: AnchorUUID[] }; // Map a source anchor to a list of destination anchors

  // private subscribers: CoreGraphSubscriber[];
  private static nodeTracker = 0;
  constructor() {
    super();
    this.nodes = {};
    this.anchors = {};
    this.edgeDest = {};
    this.edgeSrc = {};
    // this.nodeList = [];
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

  public get getEdgeSrc() {
    return this.edgeSrc;
  }

  // We need to pass in node name and plugin name
  public addNode(node: NodeInstance): UUID {
    // Create New Node
    const n: Node = new Node(
      node.getName,
      node.getPlugin,
      node.getInputAnchorInstances,
      node.getOutputAnchorInstances
    );
    // Add Node to Graph
    this.nodes[n.uuid] = n;
    // this.nodeList.push(n.uuid);
    // Add Nodes's Anchors to Graph
    for (const anchor in n.getAnchors) {
      if (!n.getAnchors.hasOwnProperty(anchor)) continue;
      this.anchors[anchor] = n.getAnchors[anchor];
    }

    return n.uuid;
    // TODO: Add Node Styling
  }

  public addEdge(anchorA: UUID, anchorB: UUID) {
    // Edge can start either from an output or input anchor
    const ancFrom =
      this.anchors[anchorA].getIOType === AnchorIO.output
        ? this.anchors[anchorA]
        : this.anchors[anchorB];
    const ancTo =
      this.anchors[anchorB].getIOType === AnchorIO.input
        ? this.anchors[anchorB]
        : this.anchors[anchorA];

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
    const edge: Edge = new Edge(ancFrom.uuid, ancTo.uuid);
    this.edgeDest[ancTo.uuid] = edge;
    if (!(ancFrom.uuid in this.edgeSrc)) this.edgeSrc[ancFrom.uuid] = [];
    this.edgeSrc[ancFrom.uuid].push(ancTo.uuid);

    return true;
  }

  public checkForDuplicateEdges(ancFrom: Anchor, ancTo: Anchor): boolean {
    // TODO
    if (ancFrom.uuid === ancTo.uuid) return true; // Needs to be changed
    return false;
  }

  public checkForCycles(ancFrom: Anchor, ancTo: Anchor): boolean {
    const curr: Node = ancFrom.getParent;
    // For each anchor in the current node
    for (const anchor in curr.getAnchors) {
      // Only check input anchors
      if (this.anchors[anchor].getIOType !== AnchorIO.output) {
        // If edge anchfor To currently exists in current node anchors then there is a cycle
        if (ancTo.uuid in curr.getAnchors) {
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

  public removeNode(nodeToDelete: UUID) {
    const node: Node = this.nodes[nodeToDelete];
    // Remove all edges from node
    for (const anchor in node.getAnchors) {
      if (!node.getAnchors.hasOwnProperty(anchor)) continue;
      // Remove all edges feeding into node
      if (this.anchors[anchor]?.getIOType === AnchorIO.input) {
        this.removeEdge(anchor);
      }
      // Remove all edges feeding out of node
      else if (this.anchors[anchor]?.getIOType === AnchorIO.output) {
        if (anchor in this.edgeSrc) {
          const anchors: AnchorUUID[] = this.edgeSrc[this.anchors[anchor].uuid];
          const length: number = anchors.length;
          // Remove all edges feeding out of current output anchor
          for (let i = 0; i < length; i++) {
            this.removeEdge(anchors[0]);
          }
        }
      }
      // Remove node anchor
      delete this.anchors[anchor];
    }
    // Remove node
    delete this.nodes[node.uuid];
  }

  public removeEdge(anchor: AnchorUUID): boolean {
    // Check if Anchor doesnt have a connecting edge
    if (!(anchor in this.edgeDest)) {
      return false;
    }

    try {
      const edge: Edge = this.edgeDest[anchor];
      // Find index of destination anchor in source anchor's list of destination anchors
      const index: number = this.edgeSrc[edge.getAnchorFrom].indexOf(anchor);
      // Remove destination anchor from source anchor's list of destination anchors
      delete this.edgeSrc[edge.getAnchorFrom][index];
      // Update list
      this.edgeSrc[edge.getAnchorFrom].splice(index, 1);
      if (this.edgeSrc[edge.getAnchorFrom].length === 0) {
        delete this.edgeSrc[edge.getAnchorFrom];
      }
      // Remove connectiong edge correlating to anchor
      delete this.edgeDest[anchor];

      return true;
    } catch (error) {
      logger.error(error);
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

  // public printGraph() {
  //   for (const edge in this.edgeDest) {
  //     if (!this.edgeDest.hasOwnProperty(edge)) continue;
  //     logger.info("Edge (same as anchorTo): " + edge);
  //     logger.info("Node From: " + this.anchors[this.edgeDest[edge].getAnchorFrom].getParent.uuid);
  //     logger.info("Node To: " + this.anchors[this.edgeDest[edge].getAnchorTo].getParent.uuid);
  //     logger.info("Anchor from -> Anchor to:");
  //     logger.info(
  //       this.anchors[this.edgeDest[edge].getAnchorFrom].uuid +
  //         " -> " +
  //         this.anchors[this.edgeDest[edge].getAnchorTo].uuid +
  //         "\n"
  //     );
  //   }
  // }
}

// This Node representation effectively 'stands-in'
// as a reference to the plugin's functional implementation.
// When we interpret the graph we dereference back to the plugin
class Node extends UniqueEntity {
  private anchors: { [key: string]: Anchor };
  private styling: NodeStyling | null = null;
  // private colour: string;

  constructor(
    private name: string, // The name id of the node in the plugin
    private plugin: string, // The name id of the plugin that defined the node
    private inputAnchors: InputAnchorInstance[], // Input anchors attatched to node
    private outputAnchors: OutputAnchorInstance[] // Output anchors attatched to node // Add colour and styling
  ) {
    super();
    this.anchors = {};

    inputAnchors.forEach((anchor) => {
      const anc = new Anchor(
        this,
        AnchorIO.input,
        anchor.type,
        anchor.displayName,
        anchor.signature
      );
      this.anchors[anc.uuid] = anc;
    });
    outputAnchors.forEach((anchor) => {
      const anc = new Anchor(
        this,
        AnchorIO.output,
        anchor.type,
        anchor.displayName,
        anchor.signature
      );
      this.anchors[anc.uuid] = anc;
    });
  }

  public get getAnchors() {
    return this.anchors;
  }

  public get getName() {
    return this.name;
  }

  get getPlugin() {
    return this.plugin;
  }

  get getStyling() {
    return this.styling;
  }
}

enum AnchorIO {
  input,
  output,
}

class Anchor extends UniqueEntity {
  private localAnchorId: number;
  constructor(
    private parent: Node,
    private ioType: AnchorIO,
    private type: AnchorType,
    private displayName: string,
    private readonly signature: string
  ) {
    super();
    this.localAnchorId = parseInt(signature.split(".")[3], 10);
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

  get getSignature() {
    return this.signature;
  }

  get getLocalAnchorId() {
    return this.localAnchorId;
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

export class NodeStyling {
  constructor(private position: { x: number; y: number }, private size: { w: number; h: number }) {}

  get getPosition() {
    return this.position;
  }

  get getSize() {
    return this.size;
  }
}
