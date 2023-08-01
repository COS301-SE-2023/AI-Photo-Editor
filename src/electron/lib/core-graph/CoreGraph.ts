import { type UUID, UniqueEntity } from "../../../shared/utils/UniqueEntity";
import {
  type AnchorType,
  InputAnchorInstance,
  NodeInstance,
  OutputAnchorInstance,
  checkEdgeDataTypesCompatible,
} from "../registries/ToolboxRegistry";
import type { EdgeToJSON, GraphToJSON, NodeToJSON } from "./CoreGraphExporter";
import { type NodeSignature } from "../../../shared/ui/ToolboxTypes";
import type { INodeUIInputs, QueryResponse, UIValue } from "../../../shared/types";
import { type GraphMetadata } from "../../../shared/ui/UIGraph";
import { type MediaOutputId } from "../../../shared/types/media";

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
  // E.g. we can do (source anchor) ---[edgeSrc]--> (destination anchors) ---[edgeDest]--> (Edges)
  //      to get all the edges that flow from a source anchor
  private outputNodes: { [key: UUID]: MediaOutputId };
  private metadata: GraphMetadata;

  // Maps a node UUID to a list of UI inputs
  private uiInputs: { [key: UUID]: CoreNodeUIInputs };

  // private subscribers: CoreGraphSubscriber[];
  private static nodeTracker = 0;
  constructor() {
    super();
    this.nodes = {};
    this.anchors = {};
    this.edgeDest = {};
    this.edgeSrc = {};
    this.outputNodes = {};
    this.uiInputs = {};
    this.metadata = {
      displayName: "Graph",
    };
    // this.nodeList = [];
  }

  // Export a reduced NodesAndEdges representation of the graph
  public exportNodesAndEdges(): NodesAndEdgesGraph {
    const graphId: UUID = this.uuid;
    const nodes: { [key: UUID]: ReducedNode } = {};
    const edges: { [key: UUID]: ReducedEdge } = {};

    // Convert nodes
    for (const node in this.nodes) {
      if (!this.nodes.hasOwnProperty(node)) continue;
      const n: Node = this.nodes[node];
      const inputs: { [key: UUID]: ReducedAnchor } = {};
      const outputs: { [key: UUID]: ReducedAnchor } = {};

      // Obtain anchors
      for (const anchor in n.getAnchors) {
        if (!n.getAnchors.hasOwnProperty(anchor)) continue;

        const a: Anchor = n.getAnchors[anchor];
        const reducedAnchor: ReducedAnchor = new ReducedAnchor(a.anchorId, a.type, a.displayName);

        (a.ioType === AnchorIO.input ? inputs : outputs)[a.uuid] = reducedAnchor;
      }

      // Obtain styling
      const styling: NodeStyling = new NodeStyling({ x: 0, y: 0 }, { w: 0, h: 0 }); // TODO

      // Create reduced node
      nodes[n.uuid] = new ReducedNode(
        n.uuid,
        `${n.getPlugin}.${n.getName}`,
        styling,
        inputs,
        outputs
      );
    }

    // Convert edges
    for (const anchorTo in this.edgeDest) {
      if (!this.edgeDest.hasOwnProperty(anchorTo)) continue;

      const edge: Edge = this.edgeDest[anchorTo];
      const edgeAnchorFrom: Anchor = this.anchors[edge.getAnchorFrom];
      const edgeAnchorTo: Anchor = this.anchors[edge.getAnchorTo];

      // Create reduced edge
      edges[edge.uuid] = new ReducedEdge(
        edge.uuid,
        edgeAnchorFrom.parent.uuid,
        edgeAnchorTo.parent.uuid,
        edgeAnchorFrom.anchorId,
        edgeAnchorTo.anchorId
      );
    }

    return new NodesAndEdgesGraph(graphId, nodes, edges);
  }

  public get getNodes() {
    return this.nodes;
  }

  public get getOutputNodes() {
    return this.outputNodes;
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

  public get getAllUIInputs() {
    return this.uiInputs;
  }

  public get getMetadata() {
    return { ...this.metadata };
  }

  public getUIInputs(nodeUUID: UUID): { [key: string]: UIValue } | null {
    return this.uiInputs[nodeUUID]?.getInputs || null;
  }

  // We need to pass in node name and plugin name
  public addNode(node: NodeInstance): QueryResponse<{
    nodeId: UUID;
    inputs: string[];
    outputs: string[];
    inputValues: Record<string, unknown>;
  }> {
    try {
      // Create New Node
      const n: Node = new Node(node.name, node.plugin, node.inputs, node.outputs);
      // Add Node to Graph
      this.nodes[n.uuid] = n;
      // Add Nodes's Anchors to Graph
      for (const anchor in n.getAnchors) {
        if (!n.getAnchors.hasOwnProperty(anchor)) continue;
        this.anchors[anchor] = n.getAnchors[anchor];
      }

      if (node.signature === "blix.output") {
        this.outputNodes[n.uuid] = "default"; // TODO: set this to a unique id and propagate to the frontend
      }

      const inputValues: Record<string, unknown> = {};
      Object.values(node.uiConfigs).forEach((config) => {
        inputValues[config.componentId] = config.defaultValue;
      });

      // console.log(QueryResponseStatus.success)
      const anchors: AiAnchors = n.returnAnchors();
      return {
        status: "success",
        message: "Node added succesfully",
        data: {
          nodeId: n.uuid,
          inputs: anchors.inputAnchors,
          outputs: anchors.outputAnchors,
          inputValues,
        },
      };
    } catch (error) {
      return { status: "error", message: error as string };
    }
    // TODO: Add Node Styling
  }

  public addEdge(anchorIdA: UUID, anchorIdB: UUID): QueryResponse<{ edgeId: UUID }> {
    const anchorA = this.anchors[anchorIdA];
    const anchorB = this.anchors[anchorIdB];

    if (!(anchorA || anchorB)) {
      return {
        status: "error",
        message: `Both anchors does not exist`,
      };
    }

    if (!anchorA) {
      // Data flowing through edge must be of same type for both anchors
      return {
        status: "error",
        message: `AnchorA does not exist`,
      };
    }

    if (!anchorB) {
      return {
        status: "error",
        message: `AnchorB does not exist`,
      };
    }

    if (anchorA.ioType === AnchorIO.output && anchorB.ioType === AnchorIO.output) {
      return {
        status: "error",
        message: "Edge cannot be connected from one output to another output",
      };
    }

    const ancFrom = anchorA.ioType === AnchorIO.output ? anchorA : anchorB;
    const ancTo = anchorB.ioType === AnchorIO.input ? anchorB : anchorA;

    // Data flowing through edge must be of same type for both anchors
    if (!checkEdgeDataTypesCompatible(ancFrom.type, ancTo.type)) {
      return {
        status: "error",
        message: "Data flowing through edge must be of same type for both anchors",
      };
    }

    if (this.checkForCycles(ancFrom, ancTo)) {
      return { status: "error", message: "Edge creates a cycle" };
    }

    if (this.checkForDuplicateEdges(ancFrom, ancTo)) {
      return { status: "error", message: "Edge already exists" };
    }

    // Add edge to graph
    // Store edge at UUID of anchor it flows into
    const edge: Edge = new Edge(ancFrom.uuid, ancTo.uuid);
    this.edgeDest[ancTo.uuid] = edge;
    if (!(ancFrom.uuid in this.edgeSrc)) this.edgeSrc[ancFrom.uuid] = [];
    this.edgeSrc[ancFrom.uuid].push(ancTo.uuid);

    return { status: "success", message: "Edge added succesfully", data: { edgeId: edge.uuid } };
  }

  public updateUIInputs(nodeUUID: UUID, nodeUIInputs: INodeUIInputs): QueryResponse {
    this.uiInputs[nodeUUID] = new CoreNodeUIInputs(nodeUIInputs);

    // If output node, update output node id
    if (this.outputNodes[nodeUUID]) {
      this.outputNodes[nodeUUID] = nodeUIInputs.inputs.outputId as MediaOutputId;
    }

    return { status: "success" };
  }

  public getUpdatedUIInputs(nodeUUID: UUID, changedUIInputs: Record<string, unknown>) {
    const currentInputValues = this.uiInputs[nodeUUID];

    if (!currentInputValues) {
      return {
        status: "error",
        message: "Node does not exist",
      } satisfies QueryResponse;
    }

    const nodeUIInputs: INodeUIInputs = {
      inputs: currentInputValues.getInputs,
      changes: [],
    };

    for (const key in changedUIInputs) {
      if (key in changedUIInputs) {
        if (key in currentInputValues.getInputs) {
          nodeUIInputs.inputs[key] = changedUIInputs[key];
          nodeUIInputs.changes.push(key);
        } else {
          return {
            status: "error",
            message: `Input value with id ${key} does not exist`,
          } satisfies QueryResponse;
        }
      }
    }

    return {
      status: "success",
      data: nodeUIInputs,
    } satisfies QueryResponse;
  }

  public checkForDuplicateEdges(ancFrom: Anchor, ancTo: Anchor): boolean {
    if (this.edgeSrc[ancFrom.uuid]) {
      return this.edgeSrc[ancFrom.uuid].includes(ancTo.uuid);
    }

    if (ancFrom.uuid === ancTo.uuid) return true; // Needs to be changed
    return false;
  }

  public checkForCycles(ancFrom: Anchor, ancTo: Anchor): boolean {
    const curr: Node = ancFrom.parent;
    // For each anchor in the current node
    for (const anchor in curr.getAnchors) {
      // Only check input anchors
      if (this.anchors[anchor].ioType !== AnchorIO.output) {
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

  public removeNode(nodeToDelete: UUID): QueryResponse {
    const node: Node = this.nodes[nodeToDelete];
    if (!node) return { status: "error", message: "Node to be deleted does not exist" };

    if (this.outputNodes[nodeToDelete]) {
      delete this.outputNodes[nodeToDelete];
    }

    try {
      // Remove all edges from node
      for (const anchor in node.getAnchors) {
        if (!node.getAnchors.hasOwnProperty(anchor)) continue;
        // Remove all edges feeding into node
        if (this.anchors[anchor]?.ioType === AnchorIO.input) {
          this.removeEdge(anchor);
        }
        // Remove all edges feeding out of node
        else if (this.anchors[anchor]?.ioType === AnchorIO.output) {
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
      return { status: "success" };
    } catch (error) {
      return { status: "error", message: error as string };
    }
  }

  public removeEdge(anchorTo: AnchorUUID): QueryResponse {
    // Check if Anchor doesnt have a connecting edge
    if (!(anchorTo in this.edgeDest)) {
      return {
        status: "error",
        message: "Anchor does not have a connecting edge",
      };
    }

    try {
      const edge: Edge = this.edgeDest[anchorTo];
      // Find index of destination anchor in source anchor's list of destination anchors
      const index: number = this.edgeSrc[edge.getAnchorFrom].indexOf(anchorTo);
      // Remove destination anchor from source anchor's list of destination anchors
      delete this.edgeSrc[edge.getAnchorFrom][index];
      // Update list
      this.edgeSrc[edge.getAnchorFrom].splice(index, 1);
      if (this.edgeSrc[edge.getAnchorFrom].length === 0) {
        delete this.edgeSrc[edge.getAnchorFrom];
      }
      // Remove connectiong edge correlating to anchor
      delete this.edgeDest[anchorTo];

      return { status: "success" };
    } catch (error) {
      return { status: "error", message: error as string };
    }
  }

  public setNodePos(node: UUID, pos: { x: number; y: number }): QueryResponse {
    if (!(node in this.nodes)) return { status: "error", message: "Node does not exist" };
    this.nodes[node].setStyling(new NodeStyling(pos, { w: 0, h: 0 })); // TODO w/h
    return { status: "success" };
  }

  public updateMetadata(updatedMetadata: Partial<GraphMetadata>) {
    if (!updatedMetadata) {
      return {
        status: "error",
        message: "No metadata provided",
      } satisfies QueryResponse;
    }

    const { displayName } = updatedMetadata;

    const newMetadata: GraphMetadata = {
      displayName: displayName ? displayName : this.metadata.displayName,
    };

    this.metadata = newMetadata;

    return {
      status: "success",
      message: "Metadata updated",
    } satisfies QueryResponse;
  }

  private copy() {
    // TODO
  }

  // public printGraph() {
  //   for (const edge in this.edgeDest) {
  //     if (!this.edgeDest.hasOwnProperty(edge)) continue;
  //     logger.info("Edge (same as anchorTo): " + edge);
  //     logger.info("Node From: " + this.anchors[this.edgeDest[edge].getAnchorFrom].parent.uuid);
  //     logger.info("Node To: " + this.anchors[this.edgeDest[edge].getAnchorTo].parent.uuid);
  //     logger.info("Anchor from -> Anchor to:");
  //     logger.info(
  //       this.anchors[this.edgeDest[edge].getAnchorFrom].getParent.getName +
  //         " -> " +
  //         this.anchors[this.edgeDest[edge].getAnchorTo].getParent.getName +
  //         "\n"
  //     );
  //   }
  // }

  // public nodesToJSONObject(): NodeToJSON[] {
  //   const json: NodeToJSON[] = [];
  //   for (const node in this.nodes) {
  //     if (!this.nodes.hasOwnProperty(node)) continue;
  //     json.push(this.nodes[node].exportJSON());
  //   }
  //   return json;
  // }

  // public edgesToJSONObject(): EdgeToJSON[] {
  //   const json: EdgeToJSON[] = [];
  //   for (const anchorFrom in this.edgeSrc) {
  //     if (!this.edgeSrc.hasOwnProperty(anchorFrom)) continue;
  //     const anchorTos: AnchorUUID[] = this.edgeSrc[anchorFrom];
  //     for (const anchorTo of anchorTos) {
  //       json.push({
  //         anchorFrom: {
  //           parent: this.anchors[anchorFrom].parent.uuid,
  //           id: anchorFrom,
  //         },
  //         anchorTo: {
  //           parent: this.anchors[anchorTo].parent.uuid,
  //           id: anchorTo,
  //         },
  //       });
  //     }
  //   }
  //   return json;
  // }
}

interface AiAnchors {
  inputAnchors: string[];
  outputAnchors: string[];
}

// This Node representation effectively 'stands-in'
// as a reference to the plugin's functional implementation.
// When we interpret the graph we dereference back to the plugin
export class Node extends UniqueEntity {
  private anchors: { [key: string]: Anchor };
  private styling?: NodeStyling;

  constructor(
    private readonly name: string, // The name id of the node in the plugin
    private readonly plugin: string, // The name id of the plugin that defined the node
    inputAnchors: InputAnchorInstance[], // Input anchors attatched to node
    outputAnchors: OutputAnchorInstance[] // Output anchors attatched to node // Add colour and styling
  ) {
    super();
    this.anchors = {};

    // readonly parent: Node,
    // readonly ioType: AnchorIO,
    // readonly type: AnchorType,
    // readonly displayName: string,
    // readonly localAnchorId: string

    inputAnchors.forEach((anchor) => {
      const anc = new Anchor(this, AnchorIO.input, anchor.id, anchor.type, anchor.displayName);
      this.anchors[anc.uuid] = anc;
    });
    outputAnchors.forEach((anchor) => {
      const anc = new Anchor(this, AnchorIO.output, anchor.id, anchor.type, anchor.displayName);
      this.anchors[anc.uuid] = anc;
    });
  }

  public returnAnchors(): AiAnchors {
    const inputAnchors: string[] = [];
    const outputAnchors: string[] = [];
    for (const anchor in this.anchors) {
      if (!this.anchors.hasOwnProperty(anchor)) continue;
      if (this.anchors[anchor].ioType === AnchorIO.input) {
        inputAnchors.push(anchor);
      } else {
        outputAnchors.push(anchor);
      }
    }
    return { inputAnchors, outputAnchors };
  }

  public setStyling(styling: NodeStyling) {
    this.styling = styling;
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

  get getSignature(): NodeSignature {
    return `${this.plugin}.${this.name}`;
  }

  get getStyling() {
    return this.styling;
  }

  public exportJSON(): NodeToJSON {
    return {
      signature: `${this.plugin}.${this.name}`,
      styling: this.styling!,
    };
  }
}

export enum AnchorIO {
  input,
  output,
}

export class Anchor extends UniqueEntity {
  constructor(
    readonly parent: Node,
    readonly ioType: AnchorIO,
    // `anchorId` IS NOT THE UUID, this is the string assigned by the plugin
    // to identify the anchor _within the node_
    readonly anchorId: string,
    readonly type: AnchorType,
    readonly displayName: string
  ) {
    super();
  }

  public getAnchorId() {
    return this.anchorId;
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

export class CoreNodeUIInputs {
  private readonly inputs: { [key: string]: UIValue };
  constructor(nodeUIInpust: INodeUIInputs) {
    this.inputs = nodeUIInpust.inputs;
  }

  public get getInputs() {
    return this.inputs;
  }
}

// ========== EXPORTED GRAPH REPRESENTATIONS ========== //
// Some reduced graph representations for exporting without trinkets for optimization

// export enum CoreGraphExportRepresentation {
//   NodesAndEdges,
//   NodesToNodes, // TODO (if required)
//   AnchorNetwork // TODO (if required)
// }

export interface GraphRepresentation {
  readonly graphId: UUID;
}

// A set of nodes and a set of edges between node anchors
export class NodesAndEdgesGraph implements GraphRepresentation {
  constructor(
    readonly graphId: UUID,
    readonly nodes: { [key: UUID]: ReducedNode },
    readonly edges: { [key: UUID]: ReducedEdge }
  ) {}
}

export class ReducedNode {
  constructor(
    readonly id: UUID,
    readonly signature: `${string}.${string}`,
    readonly styling: NodeStyling,
    readonly inputs: { [key: UUID]: ReducedAnchor },
    readonly outputs: { [key: UUID]: ReducedAnchor }
  ) {}
}

export class ReducedEdge {
  constructor(
    readonly id: UUID,
    readonly nodeUUIDFrom: UUID,
    readonly nodeUUIDTo: UUID,
    readonly anchorIdFrom: string,
    readonly anchorIdTo: string
  ) {}
}

export class ReducedAnchor {
  constructor(readonly id: string, readonly type: AnchorType, readonly displayName: string) {}
}

// A set of nodes with input anchors, output anchors point directly to other nodes' input anchors
export class NodeOutToNodeIn implements GraphRepresentation {
  // TODO
  constructor(public graphId: UUID) {}
}

// ==================================================================
// Helper Methods
// ==================================================================

// function formatIds(ids: string[], shortIds: boolean) {
//   const filteredIds = ids.filter((id) => id);
//   const formattedIds = filteredIds.map((id) => {
//     return shortIds ? id.slice(0, 6) : id;
//   });
//   return formattedIds.join(", ");
// }
