import { type UUID, UniqueEntity } from "../../../shared/utils/UniqueEntity";
import {
  type AnchorType,
  InputAnchorInstance,
  NodeInstance,
  OutputAnchorInstance,
  checkEdgeDataTypesCompatible,
} from "../registries/ToolboxRegistry";
import { INode, type NodeSignature } from "../../../shared/ui/ToolboxTypes";
import type { INodeUIInputs, QueryResponse, UIValue } from "../../../shared/types";
import { type GraphMetadata, type SvelvetCanvasPos } from "../../../shared/ui/UIGraph";
import { type MediaOutputId } from "../../../shared/types/media";
import type { EdgeBlueprint } from "./CoreGraphEventManger";
import logger from "../../utils/logger";
import { populateDials, getDialUpdatesOnUIInputsChanged } from "../ui-inputs/DialComposers";
import { NodeUIComponent } from "@shared/ui/NodeUITypes";

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
  private anchors: { [key: UUID]: Anchor };
  private edgeDest: { [key: AnchorUUID]: Edge }; // Input Anchor -> Edge
  private edgeSrc: { [key: AnchorUUID]: AnchorUUID[] }; // Output Anchor -> List[Connected Input Anchors]
  // E.g. we can do (output anchor) ---[edgeSrc]--> (input anchors) ---[edgeDest]--> (Edges)
  //      to get all the edges that flow from a source anchor
  private outputNodes: { [key: UUID]: MediaOutputId };
  private metadata: GraphMetadata;

  // Maps a node UUID to a list of UI inputs
  private uiInputs: { [key: UUID]: CoreNodeUIInputs };

  // Maps a node UUID to a UI canvas position
  private uiPositions: { [key: UUID]: SvelvetCanvasPos };

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
    this.uiPositions = {};
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

  public getUIPositions() {
    return this.uiPositions;
  }

  public set UIPositions(positions: { [key: UUID]: SvelvetCanvasPos }) {
    this.uiPositions = positions;
  }

  // We need to pass in node name and plugin name
  public addNode(node: NodeInstance, pos: SvelvetCanvasPos, uiValues?: { [key: string]: UIValue }) {
    try {
      // Create New Node
      const n: Node = new Node(node.name, node.plugin, node.inputs, node.outputs);
      n.setStyling(new NodeStyling(pos, { w: 0, h: 0 }));
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

      let inputValues: Record<string, unknown> = {};
      // let uiInputsInitialized = false;
      // New Node with default Ui Input Values
      if (!uiValues) {
        const inputs: { [key: string]: unknown } = {};
        const changes: string[] = [];
        Object.values(node.uiConfigs).forEach((config) => {
          inputValues[config.componentId] = config.defaultValue;
          inputs[config.componentId] = config.defaultValue;
        });
        this.uiInputs[n.uuid] = new CoreNodeUIInputs({ inputs, changes }, {});
      } else {
        // Loading in input values from an existing node
        // console.log("UIVALUES: ", uiValues)
        this.uiInputs[n.uuid] = new CoreNodeUIInputs(
          {
            inputs: uiValues,
            changes: [...Object.keys(uiValues)],
          },
          {}
        );
        // console.log(this.uiInputs[n.uuid].getInputs)
        Object.values(node.uiConfigs).forEach((config) => {
          inputValues[config.componentId] = uiValues[config.componentId];
        });
        // console.log(inputValues);
      }

      // Handle special readonly UI component types (e.g. TweakDial)
      const { dials: dialInputs, filledInputs: filledDialInputs } = populateDials(node.ui, {
        nodeUUID: n.uuid,
        uiInputs: Object.keys(inputValues),
        uiInputChanges: Object.keys(inputValues), // When node is created, all inputs have 'changed'
      });
      inputValues = { ...inputValues, ...filledDialInputs };

      // Handle the UI input initializer
      const initializedInputs = node.uiInitializer(inputValues);
      let uiInputsInitialized = false;
      const uiChanges = Object.keys(initializedInputs);
      if (typeof initializedInputs === "object" && uiChanges.length > 0) {
        inputValues = { ...inputValues, ...initializedInputs };

        // Update the graph's UI inputs
        const uiInputsPayload: INodeUIInputs = {
          inputs: inputValues,
          changes: uiChanges,
        };
        this.uiInputs[n.uuid] = new CoreNodeUIInputs(uiInputsPayload, dialInputs);

        uiInputsInitialized = true;
      }

      // console.log(QueryResponseStatus.success)
      const anchors: AiAnchors = n.returnAnchors();
      // Add position of node to graph
      this.uiPositions[n.uuid] = pos;

      return {
        status: "success",
        message: "Node added successfully",
        data: {
          nodeId: n.uuid,
          inputs: anchors.inputAnchors,
          outputs: anchors.outputAnchors,
          inputValues,
          uiInputsInitialized,
        },
      } satisfies QueryResponse;
    } catch (error) {
      return { status: "error", message: error as string } satisfies QueryResponse;
    }

    // TODO: Add Node Styling
  }

  public addEdge(anchorIdA: UUID, anchorIdB: UUID) {
    const anchorA = this.anchors[anchorIdA];
    const anchorB = this.anchors[anchorIdB];
    // console.log("Add Edge Anchors:", anchorIdA, anchorIdB);
    if (!(anchorA || anchorB)) {
      return {
        status: "error",
        message: `Both anchors does not exist`,
      } satisfies QueryResponse;
    }

    if (!anchorA) {
      // Data flowing through edge must be of same type for both anchors
      return {
        status: "error",
        message: `AnchorA does not exist`,
      } satisfies QueryResponse;
    }

    if (!anchorB) {
      return {
        status: "error",
        message: `AnchorB does not exist`,
      } satisfies QueryResponse;
    }

    if (anchorA.ioType === AnchorIO.output && anchorB.ioType === AnchorIO.output) {
      return {
        status: "error",
        message: "Edge cannot be connected from one output to another output",
      } satisfies QueryResponse;
    }

    const ancFrom = anchorA.ioType === AnchorIO.output ? anchorA : anchorB;
    const ancTo = anchorB.ioType === AnchorIO.input ? anchorB : anchorA;

    // Data flowing through edge must be of same type for both anchors
    if (!checkEdgeDataTypesCompatible(ancFrom.type, ancTo.type)) {
      return {
        status: "error",
        message: "Data flowing through edge must be of same type for both anchors",
      } satisfies QueryResponse;
    }

    if (this.checkForCycles(ancFrom, ancTo)) {
      return { status: "error", message: "Edge creates a cycle" } satisfies QueryResponse;
    }

    if (this.checkForDuplicateEdges(ancFrom, ancTo)) {
      return { status: "error", message: "Edge already exists" } satisfies QueryResponse;
    }

    // Add edge to graph
    // Store edge at UUID of anchor it flows into
    const edge: Edge = new Edge(ancFrom.uuid, ancTo.uuid);
    this.edgeDest[ancTo.uuid] = edge;
    if (!(ancFrom.uuid in this.edgeSrc)) this.edgeSrc[ancFrom.uuid] = [];
    this.edgeSrc[ancFrom.uuid].push(ancTo.uuid);

    return {
      status: "success",
      message: "Edge added succesfully",
      data: { edgeId: edge.uuid, anchorTo: edge.getAnchorTo, anchorFrom: edge.getAnchorFrom },
    } satisfies QueryResponse;
  }

  public updateUIInputs(nodeUUID: UUID, nodeUIInputs: INodeUIInputs) {
    // Update any DiffDials for changes
    const dialUpdates = getDialUpdatesOnUIInputsChanged(
      nodeUIInputs,
      this.uiInputs[nodeUUID].dials
    );

    const dialUpdatedInputs: INodeUIInputs = {
      inputs: { ...nodeUIInputs.inputs, ...dialUpdates },
      changes: nodeUIInputs.changes,
    };

    this.uiInputs[nodeUUID] = new CoreNodeUIInputs(
      dialUpdatedInputs,
      this.uiInputs[nodeUUID].dials
    );

    // If output node, update output node id
    if (this.outputNodes[nodeUUID]) {
      this.outputNodes[nodeUUID] = nodeUIInputs.inputs.outputId as MediaOutputId;
    }

    return { status: "success" } satisfies QueryResponse;
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

  public removeNode(nodeToDelete: UUID) {
    const node: Node = this.nodes[nodeToDelete];
    if (!node) {
      return {
        status: "error",
        message: "Node to be deleted does not exist",
      } satisfies QueryResponse;
    }

    const edges: EdgeBlueprint[] = [];

    if (this.outputNodes[nodeToDelete]) {
      delete this.outputNodes[nodeToDelete];
    }

    try {
      // Remove all edges from node
      for (const anchor in node.getAnchors) {
        if (!node.getAnchors.hasOwnProperty(anchor)) continue;
        // Remove all edges feeding into node
        if (this.anchors[anchor]?.ioType === AnchorIO.input) {
          if (this.edgeDest[anchor]) {
            // Input anchor is a anchorTo
            const edge = this.edgeDest[anchor];
            edges.push(this.createEdgeBlueprint(edge.getAnchorFrom, edge.getAnchorTo));
          }

          this.removeEdge(anchor);
        }
        // Remove all edges feeding out of node
        else if (this.anchors[anchor]?.ioType === AnchorIO.output) {
          if (anchor in this.edgeSrc) {
            const anchors: AnchorUUID[] = this.edgeSrc[this.anchors[anchor].uuid];
            const length: number = anchors.length;
            // Remove all edges feeding out of current output anchor
            for (let i = 0; i < length; i++) {
              if (this.edgeDest[anchors[0]]) {
                const edge = this.edgeDest[anchors[0]]; // Anchors array of anchorTo
                edges.push(this.createEdgeBlueprint(edge.getAnchorFrom, edge.getAnchorTo));
              }
              this.removeEdge(anchors[0]);
            }
          }
        }
        // Remove node anchor
        delete this.anchors[anchor];
      }
      // Remove node
      delete this.nodes[node.uuid];
      return {
        status: "success",
        data: { edges, uiInputs: this.uiInputs },
      } satisfies QueryResponse;
    } catch (error) {
      return { status: "error", message: error as string } satisfies QueryResponse;
    }
  }

  public removeEdge(anchorTo: AnchorUUID) {
    // Check if Anchor doesnt have a connecting edge
    // console.log("RemoveEdge")
    // console.log(anchorTo)
    if (!(anchorTo in this.edgeDest)) {
      return {
        status: "error",
        message: "Anchor does not have a connecting edge",
      } satisfies QueryResponse;
    }

    try {
      const edge: Edge = this.edgeDest[anchorTo];
      const res = { edgeId: edge.uuid, anchorTo: edge.getAnchorTo, anchorFrom: edge.getAnchorFrom };
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

      return { status: "success", data: res } satisfies QueryResponse;
    } catch (error) {
      return { status: "error", message: error as string } satisfies QueryResponse;
    }
  }

  public setNodePos(node: UUID, pos: { x: number; y: number }) {
    if (!(node in this.nodes)) {
      return { status: "error", message: "Node does not exist" } satisfies QueryResponse;
    }

    this.nodes[node].setStyling(new NodeStyling(pos, { w: 0, h: 0 })); // TODO w/h
    return { status: "success" } satisfies QueryResponse;
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

  /**
   * This function will find an anchor UUID in a node that has the provided node UUID. The anchor UUID of an anchor
   * with the same anchor id as provided will be returned.
   *
   * @param node UUID of node
   * @param anchorId Local anchor id
   * @returns UUID of anchor
   */
  public getNodeAnchor(node: UUID, anchorId: string): QueryResponse<{ anchorUUID: AnchorUUID }> {
    return this.nodes[node].findAnchorUUID(anchorId);
  }

  public debug() {
    logger.info(JSON.stringify(this.uiInputs));
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

  /**
   * This function will return the node that owns the anchor which as the provided UUID.
   *
   * @param anchorUUID UUID of an Anchor
   * @returns Parent Node of Anchor
   */
  public getAnchorParent(anchorUUID: UUID): Node {
    return this.anchors[anchorUUID].parent;
  }

  /**
   * This function will create an EdgeBluepint object using two provided anchor UUIDs.
   *
   * @param anchorAUUID UUID of an Anchor
   * @param anchorBUUID UUID of an Anchor
   * @returns An edge blueprint to be used in graph events
   */
  public createEdgeBlueprint(anchorAUUID: UUID, anchorBUUID: UUID): EdgeBlueprint {
    const input = this.anchors[anchorAUUID].ioType === AnchorIO.input ? anchorAUUID : anchorBUUID;
    const output = this.anchors[anchorAUUID].ioType === AnchorIO.output ? anchorAUUID : anchorBUUID;
    return {
      graphUUID: this.uuid,
      nodeFrom: {
        nodeUUID: this.anchors[output].parent.uuid,
        anchorId: this.anchors[output].anchorId,
      },
      nodeTo: { nodeUUID: this.anchors[input].parent.uuid, anchorId: this.anchors[input].anchorId },
    };
  }
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

  /**
   * This function is used to find the anchor UUID of an anchor with the provided anchor id.
   *
   * @param anchorId Local Id of anchor in node
   * @returns UUID of anchor
   */
  public findAnchorUUID(anchorId: string): QueryResponse<{ anchorUUID: AnchorUUID }> {
    const ids = Object.values(this.anchors).filter((anchor) => anchor.anchorId === anchorId);
    if (ids.length === 0) {
      return { status: "error", message: `Anchor with id, ${anchorId} does not exist.` };
    } else if (ids.length > 1) {
      return {
        status: "error",
        message: `Duplicate anchors exist in a plugin with the local id, ${anchorId}`,
      };
    }
    return { status: "success", data: { anchorUUID: ids[0].uuid } };
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
  readonly dials: { [key: string]: NodeUIComponent };

  constructor(nodeUIInputs: INodeUIInputs, dials: { [key: string]: NodeUIComponent }) {
    this.inputs = nodeUIInputs.inputs;
    this.dials = dials;
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
