import type { UIValue } from "../../../shared/types";
import { type AnchorUUID, CoreGraph, AnchorIO, Node, NodeStyling } from "./CoreGraph";
import { BlypescriptProgram, BlypescriptStatement, BlypescriptToolbox } from "../../lib/ai/AiLang";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import { ToolboxRegistry } from "../../lib/registries/ToolboxRegistry";
import type { SvelvetCanvasPos } from "../../../shared/ui/UIGraph";
import { BaseError } from "../../lib/ai/errors";

/**
 * This class is used to export a CoreGraph to external representations
 */
export class CoreGraphExporter<T> {
  constructor(private exporter: ExportStrategy<T>) {}

  exportGraph(graph: CoreGraph): T {
    return this.exporter.export(graph);
  }
}

interface ExportStrategy<T> {
  export(graph: CoreGraph): T;
}

export type GraphToJSON = { nodes: NodeToJSON[]; edges: EdgeToJSON[] };
export type NodeToJSON = {
  signature: string;
  position: SvelvetCanvasPos;
  inputs: { [key: string]: UIValue };
};
export type AnchorToJSON = { parent: number; id: string };
export type EdgeToJSON = { anchorFrom: AnchorToJSON; anchorTo: AnchorToJSON };

export class GraphFileExportStrategy implements ExportStrategy<GraphToJSON> {
  export(graph: CoreGraph): GraphToJSON {
    // console.log(this.nodesToJSON(graph));
    return { nodes: this.nodesToJSON(graph), edges: this.edgesToJSON(graph) };
  }

  nodesToJSON(graph: CoreGraph): NodeToJSON[] {
    const inputs = graph.getAllUIInputs;
    const json: NodeToJSON[] = [];
    for (const node in graph.getNodes) {
      if (!graph.getNodes.hasOwnProperty(node)) continue;
      json.push({
        signature: `${graph.getNodes[node].getPlugin}.${graph.getNodes[node].getName}`,
        position: graph.getUIPositions()[node],
        inputs: inputs[node].getInputs,
      });
    }

    return json;
  }

  edgesToJSON(graph: CoreGraph): EdgeToJSON[] {
    const json: EdgeToJSON[] = [];
    for (const anchorFrom in graph.getEdgeSrc) {
      if (!graph.getEdgeSrc.hasOwnProperty(anchorFrom)) continue;
      const anchorTos: AnchorUUID[] = graph.getEdgeSrc[anchorFrom];
      for (const anchorTo of anchorTos) {
        json.push({
          anchorFrom: {
            parent: Object.keys(graph.getNodes).indexOf(graph.getAnchors[anchorFrom].parent.uuid),
            id: graph.getAnchors[anchorFrom].getAnchorId(),
          },
          anchorTo: {
            parent: Object.keys(graph.getNodes).indexOf(graph.getAnchors[anchorTo].parent.uuid),
            id: graph.getAnchors[anchorTo].getAnchorId(),
          },
        });
      }
    }
    return json;
  }
}
export class YamlExportStrategy implements ExportStrategy<string> {
  export(graph: CoreGraph): string {
    throw Error("YamlExportStrategy not implemented");
  }
}

export type LLMGraph = {
  graph: {
    nodes: {
      id: string;
      signature: string;
      inputs: {
        id: string;
        type: string;
      }[];
      outputs: {
        id: string;
        type: string;
      }[];
      inputValues: Record<string, UIValue>;
    }[];
    edges: {
      id: string;
      input: string;
      output: string;
    }[];
  };
  nodeMap: Record<string, string>;
  edgeMap: Record<string, string>;
  anchorMap: Record<string, string>;
};

export class LLMExportStrategy implements ExportStrategy<LLMGraph> {
  export(graph: CoreGraph): LLMGraph {
    const llmGraph: LLMGraph = {
      graph: {
        nodes: [],
        edges: [],
      },
      nodeMap: {},
      edgeMap: {},
      anchorMap: {},
    };
    // Nodes
    Object.values(graph.getNodes).forEach((n) => {
      const node: LLMGraph["graph"]["nodes"][0] = {
        id: n.uuid.slice(0, 6),
        signature: n.getSignature,
        inputs: [],
        outputs: [],
        inputValues: {},
      };
      // Anchors for Node
      Object.values(n.getAnchors).forEach((a) => {
        if (a.ioType === AnchorIO.input) {
          node.inputs.push({ id: a.uuid.slice(0, 6), type: a.type });
        } else if (a.ioType === AnchorIO.output) {
          node.outputs.push({ id: a.uuid.slice(0, 6), type: a.type });
        }
        llmGraph.anchorMap[a.uuid.slice(0, 6)] = a.uuid;
      });
      llmGraph.graph.nodes.push(node);
      llmGraph.nodeMap[n.uuid.slice(0, 6)] = n.uuid;
      node.inputValues = graph.getUIInputs(n.uuid) || {};
    });
    // Edges
    Object.values(graph.getEdgeDest).forEach((e) => {
      llmGraph.graph.edges.push({
        id: e.uuid.slice(0, 6),
        input: e.getAnchorTo.slice(0, 6),
        output: e.getAnchorFrom.slice(0, 6),
      });
      llmGraph.edgeMap[e.uuid.slice(0, 6)] = e.uuid;
    });

    return llmGraph;
  }
}

// ==================================================================
// Blypescript Exporter v1
// ==================================================================

export class BlypescriptExportStrategy implements ExportStrategy<BlypescriptProgram> {
  private nodeOccurrenceMap!: Map<string, number>;
  private nodeIdNameMap!: Map<UUID, string>;
  private graph!: CoreGraph;

  constructor(private readonly toolbox: ToolboxRegistry) {}

  public export(graph: CoreGraph) {
    this.nodeOccurrenceMap = new Map<string, number>();
    this.nodeIdNameMap = new Map<UUID, string>();
    this.graph = graph;

    const statements: BlypescriptStatement[] = [];
    const nodeStack: Node[] = [];
    const graphNodes = Object.values(graph.getNodes);
    let remainingNodes = [...graphNodes];
    const numNodes = graphNodes.length;

    // Traverse each graph
    while (this.nodeIdNameMap.size !== numNodes) {
      const remainingNode = remainingNodes.pop();
      const sourceStatements: BlypescriptStatement[] = [];
      const internalStatements: BlypescriptStatement[] = [];
      const terminalStatements: BlypescriptStatement[] = [];

      nodeStack.push(...this.findSubgraphSources(remainingNode, new Set()));

      // Traverse each subgraph
      while (nodeStack.length !== 0) {
        const node = nodeStack.shift()!;

        if (this.nodeIdNameMap.has(node.uuid)) {
          continue;
        }

        const statement = this.createStatement(node);
        const nodeNeighbors = this.findNodeNeighbors(node);

        if (nodeNeighbors.inputNeighbors.length && nodeNeighbors.outputNeighbors.length) {
          internalStatements.push(statement);
        } else if (nodeNeighbors.inputNeighbors.length) {
          terminalStatements.push(statement);
        } else {
          sourceStatements.push(statement);
        }

        nodeStack.push(...nodeNeighbors.outputNeighbors);
        remainingNodes = remainingNodes.filter((n) => n.uuid !== node.uuid);
      }

      statements.push(...sourceStatements, ...internalStatements, ...terminalStatements);
    }

    const nodeNameIdMap = new Map<string, UUID>();

    for (const [key, value] of this.nodeIdNameMap.entries()) {
      nodeNameIdMap.set(value, key);
    }

    return new BlypescriptProgram(statements, nodeNameIdMap);
  }

  private getOutputNodes(): Node[] {
    const outputIds = Object.keys(this.graph.getOutputNodes);
    return outputIds.map((id) => this.graph.getNodes[id]);
  }

  /**
   * Finds the terminal nodes within a subgraph starting from the given node in a core graph.
   * Terminal nodes are nodes that have no outgoing connections.
   *
   * @param node - The starting node.
   * @param graph - The core graph.
   * @returns An array of terminal nodes within the subgraph.
   */
  // private findSubgraphTerminals(node: Node | undefined, graph: CoreGraph): Node[] {
  //   if (!node) {
  //     return [];
  //   }

  //   const outputNeighbors: Node[] = [];
  //   const nodeAnchors = Object.values(node.getAnchors);
  //   const nodeOutputAnchors = nodeAnchors.filter((a) => a.ioType === AnchorIO.output);

  //   for (const anchor of nodeOutputAnchors) {
  //     outputNeighbors.push(...this.findSubgraphTerminals(anchor.parent, graph));
  //   }

  //   if (outputNeighbors.length === 0) {
  //     return [node];
  //   }

  //   return outputNeighbors;
  // }

  /**
   * Finds the source nodes within a subgraph starting from the given node in a core graph.
   * Source nodes are nodes at the start of the directed graph.
   *
   * @param node - The starting node.
   * @param graph - The core graph.
   * @returns An array of source nodes within the subgraph.
   */
  private findSubgraphSources(node: Node | undefined, visited: Set<UUID>): Node[] {
    if (!node) {
      return [];
    }

    visited.add(node.uuid);

    const { inputNeighbors, outputNeighbors } = this.findNodeNeighbors(node);
    const neighbors = [...inputNeighbors, ...outputNeighbors];
    const sourceNodes: Node[] = [];

    if (inputNeighbors.length === 0) {
      sourceNodes.push(node);
    }

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.uuid)) {
        sourceNodes.push(...this.findSubgraphSources(neighbor, visited));
      }
    }

    return sourceNodes;
  }

  private findNodeNeighbors(node: Node) {
    const inputNeighbors: Record<UUID, Node> = {};
    const outputNeighbors: Record<UUID, Node> = {};
    const anchors = Object.values(node.getAnchors);

    for (const anchor of anchors) {
      if (anchor.ioType === AnchorIO.input) {
        const outputAnchorId = this.graph.getEdgeDest[anchor.uuid]?.getAnchorFrom;

        if (outputAnchorId) {
          const outputAnchor = this.graph.getAnchors[outputAnchorId];
          inputNeighbors[outputAnchor.parent.uuid] = outputAnchor.parent;
        }
      } else {
        const inputAnchorIds = this.graph.getEdgeSrc[anchor.uuid];

        if (inputAnchorIds) {
          for (const inputAnchorId of inputAnchorIds) {
            const inputAnchor = this.graph.getAnchors[inputAnchorId];
            outputNeighbors[inputAnchor.parent.uuid] = inputAnchor.parent;
          }
        }
      }
    }

    const neighbors = {
      inputNeighbors: Object.values(inputNeighbors),
      outputNeighbors: Object.values(outputNeighbors),
    };

    return neighbors;
  }

  private createStatement(node: Node): BlypescriptStatement {
    let name = node.getName;
    const signature = `${node.getPlugin}.${node.getName}` as const;
    const inputs: string[] = [];
    // Potential look into using node signature instead of node name
    const counter = this.nodeOccurrenceMap.get(name) || 0;

    this.nodeOccurrenceMap.set(name, counter + 1);
    name += `${counter + 1}`;
    this.nodeIdNameMap.set(node.uuid, name);

    const nodeInstance = this.toolbox.getNodeInstance(signature);
    const inputIdentifiers = nodeInstance.inputs.map((input) => input.id);

    // Add node inputs first
    for (const identifier of inputIdentifiers) {
      const anchor = Object.values(node.getAnchors).find((a) => a.anchorId === identifier);
      const inputEdge = this.graph.getEdgeDest[anchor?.uuid || ""];

      if (inputEdge) {
        const outputAnchor = this.graph.getAnchors[inputEdge.getAnchorFrom];
        const outputNode = outputAnchor.parent;
        inputs.push(`${this.nodeIdNameMap.get(outputNode.uuid)!}['${outputAnchor.anchorId}']`);
      } else {
        inputs.push("null");
      }
    }

    const nodeUiInputs = this.graph.getUIInputs(node.uuid);

    if (!nodeUiInputs) {
      return new BlypescriptStatement(name, signature, inputs);
    }

    const uiConfigs = Object.values(nodeInstance.uiConfigs);
    const uiInputIdentifiers = uiConfigs.map((config) => config.componentId);

    // Then add UI inputs
    for (const identifier of uiInputIdentifiers) {
      const uiValue = nodeUiInputs[identifier];
      // Improve to work with more than just string an ints
      inputs.push(typeof uiValue === "string" ? `'${uiValue}'` : `${uiValue as string}`);
    }

    return new BlypescriptStatement(name, signature, inputs);
  }
}

// ==================================================================
// Blypescript Exporter v2
// ==================================================================

export class BlypescriptExportStrategyV2 implements ExportStrategy<BlypescriptProgram> {
  private nodeOccurrenceMap!: Map<string, number>;
  private nodeIdNameMap!: Map<UUID, string>;
  private graph!: CoreGraph;

  constructor(private readonly toolbox: BlypescriptToolbox) {}

  public export(graph: CoreGraph) {
    this.nodeOccurrenceMap = new Map<string, number>();
    this.nodeIdNameMap = new Map<UUID, string>();
    this.graph = graph;

    const statements: BlypescriptStatement[] = [];
    const nodeStack: Node[] = [];
    const graphNodes = Object.values(graph.getNodes);
    let remainingNodes = [...graphNodes];
    const numNodes = graphNodes.length;

    // Traverse each graph
    while (this.nodeIdNameMap.size !== numNodes) {
      const remainingNode = remainingNodes.pop();
      const sourceStatements: BlypescriptStatement[] = [];
      const internalStatements: BlypescriptStatement[] = [];
      const terminalStatements: BlypescriptStatement[] = [];

      nodeStack.push(...this.findSubgraphSources(remainingNode, new Set()));

      // Traverse each subgraph
      while (nodeStack.length !== 0) {
        const node = nodeStack.shift()!;

        if (this.nodeIdNameMap.has(node.uuid)) {
          continue;
        }

        const statement = this.createStatement(node);
        const nodeNeighbors = this.findNodeNeighbors(node);

        if (nodeNeighbors.inputNeighbors.length && nodeNeighbors.outputNeighbors.length) {
          internalStatements.push(statement);
        } else if (nodeNeighbors.inputNeighbors.length) {
          terminalStatements.push(statement);
        } else {
          sourceStatements.push(statement);
        }

        nodeStack.push(...nodeNeighbors.outputNeighbors);
        remainingNodes = remainingNodes.filter((n) => n.uuid !== node.uuid);
      }

      statements.push(...sourceStatements, ...internalStatements, ...terminalStatements);
    }

    const nodeNameIdMap = new Map<string, UUID>();

    for (const [key, value] of this.nodeIdNameMap.entries()) {
      nodeNameIdMap.set(value, key);
    }

    return new BlypescriptProgram(statements, nodeNameIdMap);
  }

  /**
   * Finds the source nodes within a subgraph starting from the given node in a core graph.
   * Source nodes are nodes at the start of the directed graph.
   *
   * @param node - The starting node.
   * @param graph - The core graph.
   * @returns An array of source nodes within the subgraph.
   */
  private findSubgraphSources(node: Node | undefined, visited: Set<UUID>): Node[] {
    if (!node) {
      return [];
    }

    visited.add(node.uuid);

    const { inputNeighbors, outputNeighbors } = this.findNodeNeighbors(node);
    const neighbors = [...inputNeighbors, ...outputNeighbors];
    const sourceNodes: Node[] = [];

    if (inputNeighbors.length === 0) {
      sourceNodes.push(node);
    }

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.uuid)) {
        sourceNodes.push(...this.findSubgraphSources(neighbor, visited));
      }
    }

    return sourceNodes;
  }

  private findNodeNeighbors(node: Node) {
    const inputNeighbors: Record<UUID, Node> = {};
    const outputNeighbors: Record<UUID, Node> = {};
    const anchors = Object.values(node.getAnchors);

    for (const anchor of anchors) {
      if (anchor.ioType === AnchorIO.input) {
        const outputAnchorId = this.graph.getEdgeDest[anchor.uuid]?.getAnchorFrom;

        if (outputAnchorId) {
          const outputAnchor = this.graph.getAnchors[outputAnchorId];
          inputNeighbors[outputAnchor.parent.uuid] = outputAnchor.parent;
        }
      } else {
        const inputAnchorIds = this.graph.getEdgeSrc[anchor.uuid];

        if (inputAnchorIds) {
          for (const inputAnchorId of inputAnchorIds) {
            const inputAnchor = this.graph.getAnchors[inputAnchorId];
            outputNeighbors[inputAnchor.parent.uuid] = inputAnchor.parent;
          }
        }
      }
    }

    const neighbors = {
      inputNeighbors: Object.values(inputNeighbors),
      outputNeighbors: Object.values(outputNeighbors),
    };

    return neighbors;
  }

  private createStatement(node: Node): BlypescriptStatement {
    let name = node.getName;
    const signature = `${node.getPlugin}.${node.getName}` as const;
    const inputs: string[] = [];
    // Potential look into using node signature instead of node name
    const counter = this.nodeOccurrenceMap.get(name) || 0;

    this.nodeOccurrenceMap.set(name, counter + 1);
    name += `${counter + 1}`;
    this.nodeIdNameMap.set(node.uuid, name);

    
    const blypescriptNode = this.toolbox.getNode(node.getSignature);

    if (!blypescriptNode) {
      console.log(signature);
      console.log(this.toolbox.getPlugin(signature.split(".")[0]))
      console.log(this.toolbox.plugins)
      throw new BaseError("Graph node not found in Blypescript toolbox");
    }

    const inputAnchorNames = blypescriptNode.nodeInputs
      .filter((input) => input.aiCanUse)
      .map((input) => input.name);

    // Add node input anchors first
    for (const inputAnchorName of inputAnchorNames) {
      const anchor = Object.values(node.getAnchors).find((a) => a.anchorId === inputAnchorName);
      const inputEdge = this.graph.getEdgeDest[anchor?.uuid || ""];

      if (inputEdge) {
        const outputAnchor = this.graph.getAnchors[inputEdge.getAnchorFrom];
        const outputNode = outputAnchor.parent;
        inputs.push(`${this.nodeIdNameMap.get(outputNode.uuid)!}['${outputAnchor.anchorId}']`);
      } else {
        inputs.push("null");
      }
    }

    const nodeUiInputs = this.graph.getUIInputs(node.uuid);

    if (!nodeUiInputs) {
      return new BlypescriptStatement(name, signature, inputs);
    }

    const uiInputNames = blypescriptNode.uiInputs
      .filter((input) => input.aiCanUse)
      .map((input) => input.name);

    // Then add UI inputs
    for (const uiInputName of uiInputNames) {
      const uiValue = nodeUiInputs[uiInputName];
      // Improve to work with more than just string an ints
      inputs.push(typeof uiValue === "string" ? `'${uiValue}'` : `${uiValue as string}`);
    }

    return new BlypescriptStatement(name, signature, inputs);
  }

}
