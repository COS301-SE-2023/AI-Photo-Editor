import { CoreGraphManager } from "../../lib/core-graph/CoreGraphManager";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import { NodeInstance, ToolboxRegistry } from "../../lib/registries/ToolboxRegistry";
import { CoreGraphUpdateParticipant } from "../../lib/core-graph/CoreGraphInteractors";
import { type CoreGraph, CoreNodeUIInputs, type Node } from "../../lib/core-graph/CoreGraph";
import type { INodeUIInputs } from "../../../shared/types";
import { NodeUI, NodeUILeaf } from "../../../shared/ui/NodeUITypes";
import { type Result, BaseError } from "./errors";
import { z } from "zod";

// Created custom error type to potential extension in future easier

abstract class AiLangProgram {
  public abstract diff(other: AiLangProgram): AiLangDiff;
  public abstract toString(): string;
}

abstract class AiLangStatement {
  public abstract toString(): string;

  constructor(
    public readonly name: string,
    public readonly nodeSignature: `${string}.${string}`,
    public readonly nodeInputs: string[]
  ) {}

  checkEquals(other: BlypescriptStatement): boolean {
    return (
      this.name === other.name &&
      this.nodeSignature === other.nodeSignature &&
      this.nodeInputs.length === other.nodeInputs.length &&
      this.nodeInputs.every((input, i) => input === other.nodeInputs[i])
    );
  }
}

export type AiLangDiff = {
  added: AiLangStatement[];
  removed: AiLangStatement[];
  changed: AiLangStatement[];
};

export class BlypescriptProgram implements AiLangProgram {
  constructor(
    public readonly statements: BlypescriptStatement[],
    public nodeNameIdMap: Map<string, UUID>
  ) {}

  public static fromString(program: string): BlypescriptProgram | null {
    const nodeNameIdMap = new Map<string, UUID>();
    const match = program.match(/^.*function\s*graph\(\)\s*{([\s\S]*)}.*$/s);
    if (!match) return null;
    const extractedProgram = match[1];
    const statements = extractedProgram
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s || !s.startsWith("//"));
    const resStatements = [];
    const usedNodeIds = new Set<string>();

    for (let s = 0; s < statements.length; s++) {
      if (statements[s].length === 0 || statements[s].startsWith("//")) continue;

      const statement = BlypescriptStatement.fromString(statements[s]);

      // TODO: Fail + return error message to the AI when a statement is invalid
      if (statement === null) return null; // Invalid statement
      if (usedNodeIds.has(statement.name)) return null; // Duplicate nodeId

      nodeNameIdMap.set(statement.name, "");
      statement.lineNumber = s;
      resStatements.push(statement);
      usedNodeIds.add(statement.name);
    }

    return new BlypescriptProgram(resStatements, nodeNameIdMap);
  }

  public toString(): string {
    let res = "graph {\n";
    for (let s = 0; s < this.statements.length; s++) {
      if (s % 5 === 0) res += `  //===== SECTION ${s / 5} =====//\n`;

      res += `  ${this.statements[s].toString()}\n`;
    }
    return res + "}";
  }

  // Computes a diff between two BlypescriptPrograms
  // Assumes that all statement lines are unique within a program by the nodeId
  // (this is enforced by the constructor)
  public diff(other: BlypescriptProgram): AiLangDiff {
    // Compute list difference (this) \ (other)
    const removed = this.statements.filter(
      (ts) => !other.statements.some((os) => ts.checkEquals(os))
    );

    // Compute list difference (other) \ (this)
    const added = other.statements.filter(
      (os) => !this.statements.some((ts) => os.checkEquals(ts))
    );

    const changed: AiLangStatement[] = [];

    return { added, removed, changed };
  }

  public diffV2(other: BlypescriptProgram): AiLangDiff {
    const removed = this.statements.filter((ts) => !other.nodeNameIdMap.has(ts.name));
    const added = other.statements.filter((os) => !this.nodeNameIdMap.has(os.name));
    // Make it an array of objects, with old and new statement properties
    const changed = other.statements.filter(
      (os) =>
        !removed.includes(os) &&
        !added.includes(os) &&
        !this.statements.some((ts) => os.checkEquals(ts))
    );
    return { added, removed, changed };
  }

  public addNodeIds(other: BlypescriptProgram) {
    this.statements.forEach((statement) => {
      const id = other.nodeNameIdMap.get(statement.name);
      if (id) {
        this.nodeNameIdMap.set(statement.name, id);
      }
    });
  }
}

// var 139dfjslaf = hello-plugin.gloria(10, "The quick brown fox jumps over the lazy dog");
// var 12u394238x = hello-plugin.hello(139dfjslaf["output1"]);
// var afhuoewnc2 = math-plugin.add(139dfjslaf["output2"], 12u394238x["out"]);
const BlypescriptStatementRegex =
  /\s*var\s*([a-zA-Z_]\w+)\s*=\s*([\w-]+)\s*\.\s*([\w-]+)\s*\((.*)\)\s*;/;

// A single line in a BlypescriptProgram
export class BlypescriptStatement extends AiLangStatement {
  public lineNumber?: number;

  public static fromString(statement: string): BlypescriptStatement | null {
    const match = statement.match(BlypescriptStatementRegex);
    if (match) {
      return new BlypescriptStatement(
        match[1],
        `${match[2]}.${match[3]}`,

        // TODO: Look into being a bit smarter about checking/storing input 'arguments'
        match[4].split(",").map((s) => s.trim())
      );
    }
    return null;
  }

  public toString(): string {
    return `var ${this.name} = ${this.nodeSignature}(${this.nodeInputs.join(", ")});`;
  }
}

export class BlypescriptInterpreter {
  constructor(
    private readonly toolbox: ToolboxRegistry,
    private readonly graphManager: CoreGraphManager
  ) {}

  public run(
    graphId: UUID,
    oldProgram: BlypescriptProgram,
    newProgram: BlypescriptProgram,
    verbose = false
  ) {
    const graph = this.graphManager.getGraph(graphId);
    const { added, removed, changed } = oldProgram.diffV2(newProgram);
    newProgram.addNodeIds(oldProgram);

    if (verbose) {
      console.log(colorString("//==========Old Program==========//", "ORANGE"));
      console.log(oldProgram.toString());
      console.log(colorString("//==========New Program==========//", "GREEN"));
      console.log(newProgram.toString());
      console.log(colorString("//==========Diff==========//", "LIGHT_BLUE"));
      console.log(JSON.stringify({ added, removed, changed }, null, 2));
      // console.log(colorString("//==========New Program Node Name Map==========//", "LIGHT_BLUE"));
      // console.log(newProgram.nodeNameIdMap.entries());
    }

    // Remove nodes
    //   for (const name of oldProgram.nodeNameIdMap.keys()) {
    //     if (!newProgram.nodeNameIdMap.has(name)) {
    //       const nodeId = oldProgram.nodeNameIdMap.get(name);
    //       if (!nodeId) {
    //         console.log(colorString(`Could not find node with name: ${name}`, "RED"));
    //         continue;
    //       }
    //       this.graphManager.removeNode(graphId, nodeId, CoreGraphUpdateParticipant.ai);
    //     }
    //   }

    // Problem: If Blypescript program created from string the vars not mapped
    // to node Uuids. Need to try map uuids from old program. When and where to
    // do this mapping? When adding new nodes I can update the map as I go. What
    // about already existing nodes?
    //

    // Remove nodes
    removed.forEach((statement) => {
      const nodeId = oldProgram.nodeNameIdMap.get(statement.name);
      // this.graphManager.removeNode(graphId, nodeId!, CoreGraphUpdateParticipant.ai);
      graph.removeNode(nodeId!);
    });

    // Add nodes
    added.forEach((statement) => {
      const nodeInstance = this.toolbox.getNodeInstance(statement.nodeSignature);
      // const response = this.graphManager.addNode(
      //   graphId,
      //   nodeInstance,
      //   { x: 0, y: 0 },
      //   CoreGraphUpdateParticipant.ai
      // );
      const response = graph.addNode(nodeInstance, { x: 0, y: 0 });

      if (response.status === "error" || !response.data) {
        throw Error("Error while adding node to graph");
      }

      newProgram.nodeNameIdMap.set(statement.name, response.data.nodeId);
    });

    // Change edges and ui inputs
    [...added, ...changed].forEach((statement) => {
      const nodeId = newProgram.nodeNameIdMap.get(statement.name);
      const node = graph.getNodes[nodeId || ""];

      if (!node) {
        throw Error("Node id not defined in changed statements");
      }

      this.changeEdges(node, graph, statement, newProgram);
      this.changeUiInputs(node, graph, statement);
    });

    // for (const statement of added) {
    //   // TODO: Check if node was not found then generate error
    //   const nodeInstance = this.toolbox.getNodeInstance(statement.nodeSignature);
    //   const response = this.graphManager.addNode(
    //     graphId,
    //     nodeInstance,
    //     { x: 0, y: 0 },
    //     CoreGraphUpdateParticipant.ai
    //   );

    //   if (response.status === "error" || !response.data) {
    //     throw Error("Error while adding node to graph");
    //   }

    //   // TODO: Look at parameters and set the values of the node
    //   // Should kinda be the exact same logic as the changed

    //   // Need way to map new nodeId to var variable name
    //   newProgram.nodeNameIdMap.set(statement.name, response.data.nodeId);
    //   const node = graph.getNodes[response.data.nodeId];

    //   this.changeEdges(node, graph, statement);
    //   this.changeUiInputs(node, statement);

    //   // ======================================================== //

    //   // const anchorIdMap = this.mapAnchorIdsToUuids(node);
    //   // let index = 0;

    //   // for (const input of nodeInstance.inputs) {
    //   //   const edge = graph.getEdgeDest[anchorIdMap[input.id]];
    //   //   const anchorInput = statement.nodeInputs[index];

    //   //   if (anchorInput === "null") {
    //   //     if (edge) {
    //   //       this.graphManager.removeEdge(graphId, edge.getAnchorTo, CoreGraphUpdateParticipant.ai);
    //   //     }
    //   //   } else {
    //   //     const match = anchorInput.match(/^(.*)\['(.*)'\]$/);
    //   //     if (!match) {
    //   //       // Some shit went wrong make sure to add errors
    //   //       continue;
    //   //     }

    //   //     const outputNodeId = newProgram.nodeNameIdMap.get(match[1]);
    //   //     if (!outputNodeId) {
    //   //       // Error do some shit
    //   //       continue;
    //   //     }

    //   //     const fromNodeAnchors = this.mapAnchorIdsToUuids(graph.getNodes[outputNodeId]);
    //   //     const outputAnchorId = fromNodeAnchors[match[2]];
    //   //     const inputAnchorId = anchorIdMap[input.id];
    //   //     this.graphManager.addEdge(graphId, outputAnchorId, inputAnchorId, CoreGraphUpdateParticipant.ai);
    //   //   }
    //   //   index++;
    //   // }

    //   // const uiInputs = graph.getUIInputs(node.uuid);
    //   // console.log(uiInputs)

    //   // if (!uiInputs) {
    //   //   // some error shit
    //   //   continue;
    //   // }

    //   // for (const uiInputKey of Object.keys(nodeInstance.uiConfigs)) {
    //   //     const value = statement.nodeInputs[index++];
    //   //     if (!isNaN(Number(value))) {
    //   //       uiInputs[uiInputKey] = Number(value);
    //   //     } else {
    //   //       uiInputs[uiInputKey] = value.slice(1, -1);
    //   //     }
    //   // }

    //   // const newNodeUiInputs = {inputs: uiInputs, changes: []};
    //   // this.graphManager.updateUIInputs(graphId, node.uuid, newNodeUiInputs, CoreGraphUpdateParticipant.ai)

    //   // console.log(graph.getUIInputs(node.uuid));
    //   // console.log()
    // }
  }

  private changeEdges(
    node: Node,
    graph: CoreGraph,
    statement: AiLangStatement,
    program: BlypescriptProgram
  ) {
    const nodeInstance = this.toolbox.getNodeInstance(statement.nodeSignature);

    if (!nodeInstance) {
      throw Error("Node instance not found when changing edges");
    }

    const nodeInputAnchorIds = nodeInstance.inputs.map((input) => input.id);
    const anchorsIdToUuid = this.mapAnchorIdsToUuids(node);

    nodeInputAnchorIds.forEach((anchorId, i) => {
      const edge = graph.getEdgeDest[anchorsIdToUuid[anchorId]];
      const anchorInput = statement.nodeInputs[i];

      if (edge) {
        // const response = this.graphManager.removeEdge(
        //   graph.uuid,
        //   edge.getAnchorTo,
        //   CoreGraphUpdateParticipant.ai
        // );
        graph.removeEdge(edge.getAnchorTo);
        // TODO: Handle response
      }

      if (anchorInput === "null") {
        return;
      }

      const match = anchorInput.match(/^(.*)\['(.*)'\]$/);

      if (!match) {
        throw Error("Could not match anchor parameters when changing edges");
      }

      const [_, outputNodeId, outputNodeAnchorId] = match;

      if (!outputNodeId || !outputNodeAnchorId) {
        // Prolly means language model added primitive instead of connecting input edge
        throw Error("Could not match anchor parameters when changing edges");
      }

      const fromNodeUuid = program.nodeNameIdMap.get(outputNodeId);

      if (!fromNodeUuid) {
        throw Error("Error retrieving output node id from program map");
      }

      const fromNode = graph.getNodes[fromNodeUuid];
      const fromNodeAnchors = this.mapAnchorIdsToUuids(fromNode);
      const outputAnchorUuid = fromNodeAnchors[outputNodeAnchorId];
      const inputAnchorUuid = anchorsIdToUuid[anchorId];
      // this.graphManager.addEdge(
      //   graph.uuid,
      //   outputAnchorUuid,
      //   inputAnchorUuid,
      //   CoreGraphUpdateParticipant.ai
      // );
      graph.addEdge(outputAnchorUuid, inputAnchorUuid);
    });

    // const uiInputs = graph.getUIInputs(node.uuid);
    // console.log(uiInputs)

    // if (!uiInputs) {
    //   // some error shit
    //   continue;
    // }

    // for (const uiInputKey of Object.keys(nodeInstance.uiConfigs)) {
    //     const value = statement.nodeInputs[index++];
    //     if (!isNaN(Number(value))) {
    //       uiInputs[uiInputKey] = Number(value);
    //     } else {
    //       uiInputs[uiInputKey] = value.slice(1, -1);
    //     }
    // }

    // const newNodeUiInputs = {inputs: uiInputs, changes: []};
    // this.graphManager.updateUIInputs(graphId, node.uuid, newNodeUiInputs, CoreGraphUpdateParticipant.ai)

    // console.log(graph.getUIInputs(node.uuid));
    // console.log()
  }

  private changeUiInputs(node: Node, graph: CoreGraph, statement: AiLangStatement) {
    const nodeInstance = this.toolbox.getNodeInstance(statement.nodeSignature);
    const uiInputs = graph.getUIInputs(node.uuid);

    if (!uiInputs) {
      throw Error("Error finding node ui inputs");
    }

    // Check ordering uniqueness cause its map and not list
    const uiInputIds = Object.keys(nodeInstance.uiConfigs);
    const uiInputValues = statement.nodeInputs.slice(-uiInputIds.length);
    const newNodeUiInputs: INodeUIInputs = { inputs: { ...uiInputs }, changes: [] };

    uiInputIds.forEach((uiInputId, i) => {
      const uiInputValue = uiInputValues[i];

      if (!isNaN(Number(uiInputValue))) {
        newNodeUiInputs.inputs[uiInputId] = Number(uiInputValue);
      } else {
        // SLice of the quotes
        newNodeUiInputs.inputs[uiInputId] = uiInputValue.slice(1, -1);
      }

      newNodeUiInputs.changes.push(uiInputId);
    });

    // this.graphManager.updateUIInputs(
    //   graph.uuid,
    //   node.uuid,
    //   newNodeUiInputs,
    //   CoreGraphUpdateParticipant.ai
    // );
    graph.updateUIInputs(node.uuid, newNodeUiInputs);
  }

  private mapAnchorIdsToUuids(node: Node) {
    const nodeAnchors = node.getAnchors;
    const map = Object.entries(nodeAnchors).reduce((result, [key, value]) => {
      result[value.anchorId] = key;
      return result;
    }, {} as { [key: string]: UUID });
    return map;
  }
}

export class BlypescriptInterpreterV2 {
  private blypescriptToolbox: BlypescriptToolbox;

  constructor(
    private readonly toolbox: ToolboxRegistry,
    private readonly graphManager: CoreGraphManager
  ) {
    const result = BlypescriptToolbox.fromToolbox(this.toolbox);

    if (!result.success) {
      throw result.error;
    }

    this.blypescriptToolbox = result.data;
  }

  public run(
    graphId: UUID,
    oldProgram: BlypescriptProgram,
    newProgram: BlypescriptProgram,
    verbose = false
  ) {
    const graph = this.graphManager.getGraph(graphId);
    const { added, removed, changed } = oldProgram.diffV2(newProgram);
    newProgram.addNodeIds(oldProgram);

    if (verbose) {
      console.log(colorString("//==========Old Program==========//", "ORANGE"));
      console.log(oldProgram.toString());
      console.log(colorString("//==========New Program==========//", "GREEN"));
      console.log(newProgram.toString());
      console.log(colorString("//==========Diff==========//", "LIGHT_BLUE"));
      console.log(JSON.stringify({ added, removed, changed }, null, 2));
    }

    // Remove nodes
    removed.forEach((statement) => {
      const nodeId = oldProgram.nodeNameIdMap.get(statement.name);
      // this.graphManager.removeNode(graphId, nodeId!, CoreGraphUpdateParticipant.ai);
      graph.removeNode(nodeId!);
    });

    // Add nodes
    added.forEach((statement) => {
      const nodeInstance = this.toolbox.getNodeInstance(statement.nodeSignature);
      // const response = this.graphManager.addNode(
      //   graphId,
      //   nodeInstance,
      //   { x: 0, y: 0 },
      //   CoreGraphUpdateParticipant.ai
      // );
      const response = graph.addNode(nodeInstance, { x: 0, y: 0 });

      if (response.status === "error" || !response.data) {
        throw Error("Error while adding node to graph");
      }

      newProgram.nodeNameIdMap.set(statement.name, response.data.nodeId);
    });

    // Change edges and ui inputs
    // Optimizations can be made to treat added edges and changed edges differently
    [...added, ...changed].forEach((statement) => {
      const nodeId = newProgram.nodeNameIdMap.get(statement.name);
      const node = graph.getNodes[nodeId || ""];

      if (!node) {
        throw Error("Node id not defined in changed statements");
      }

      this.changeEdges(node, graph, statement, newProgram);
      this.changeUiInputs(node, graph, statement);
    });
  }

  // Improve so that it checks if edge should actually be changed
  private changeEdges(
    node: Node,
    graph: CoreGraph,
    statement: AiLangStatement,
    program: BlypescriptProgram
  ) {
    const blypescriptNode = this.blypescriptToolbox.getNode(statement.nodeSignature);

    if (!blypescriptNode) {
      throw Error("Node instance not found when changing edges");
    }

    const nodeInputAnchorIds = blypescriptNode.nodeInputs
      .filter((input) => input.aiCanUse)
      .map((input) => input.name);
    const anchorsIdToUuid = this.mapAnchorIdsToUuids(node);

    nodeInputAnchorIds.forEach((anchorId, i) => {
      const edge = graph.getEdgeDest[anchorsIdToUuid[anchorId]];
      const anchorInput = statement.nodeInputs[i];

      if (edge) {
        // const response = this.graphManager.removeEdge(
        //   graph.uuid,
        //   edge.getAnchorTo,
        //   CoreGraphUpdateParticipant.ai
        // );
        graph.removeEdge(edge.getAnchorTo);
        // TODO: Handle response
      }

      if (anchorInput === "null") {
        return;
      }

      const match = anchorInput.match(/^(.*)\['(.*)'\]$/);

      if (!match) {
        throw Error("Could not match anchor parameters when changing edges");
      }

      const [_, outputNodeId, outputNodeAnchorId] = match;

      if (!outputNodeId || !outputNodeAnchorId) {
        // Prolly means language model added primitive instead of connecting input edge
        throw Error("Could not match anchor parameters when changing edges");
      }

      const fromNodeUuid = program.nodeNameIdMap.get(outputNodeId);

      if (!fromNodeUuid) {
        throw Error("Error retrieving output node id from program map");
      }

      const fromNode = graph.getNodes[fromNodeUuid];
      const fromNodeAnchors = this.mapAnchorIdsToUuids(fromNode);
      const outputAnchorUuid = fromNodeAnchors[outputNodeAnchorId];
      const inputAnchorUuid = anchorsIdToUuid[anchorId];
      // this.graphManager.addEdge(
      //   graph.uuid,
      //   outputAnchorUuid,
      //   inputAnchorUuid,
      //   CoreGraphUpdateParticipant.ai
      // );
      graph.addEdge(outputAnchorUuid, inputAnchorUuid);
    });

    // const uiInputs = graph.getUIInputs(node.uuid);
    // console.log(uiInputs)

    // if (!uiInputs) {
    //   // some error shit
    //   continue;
    // }

    // for (const uiInputKey of Object.keys(nodeInstance.uiConfigs)) {
    //     const value = statement.nodeInputs[index++];
    //     if (!isNaN(Number(value))) {
    //       uiInputs[uiInputKey] = Number(value);
    //     } else {
    //       uiInputs[uiInputKey] = value.slice(1, -1);
    //     }
    // }

    // const newNodeUiInputs = {inputs: uiInputs, changes: []};
    // this.graphManager.updateUIInputs(graphId, node.uuid, newNodeUiInputs, CoreGraphUpdateParticipant.ai)

    // console.log(graph.getUIInputs(node.uuid));
    // console.log()
  }

  private changeUiInputs(node: Node, graph: CoreGraph, statement: AiLangStatement) {
    const blypescriptNode = this.blypescriptToolbox.getNode(statement.nodeSignature);
    const uiInputs = graph.getUIInputs(node.uuid);

    if (!uiInputs || !blypescriptNode) {
      throw Error("Error finding node ui inputs");
    }

    const uiInputIds = blypescriptNode.uiInputs
      .filter((input) => input.aiCanUse)
      .map((input) => input.name);
    const uiInputValues = statement.nodeInputs.slice(-uiInputIds.length);
    const newNodeUiInputs: INodeUIInputs = { inputs: { ...uiInputs }, changes: [] };

    uiInputIds.forEach((uiInputId, i) => {
      const uiInputValue = uiInputValues[i];

      if (!isNaN(Number(uiInputValue))) {
        newNodeUiInputs.inputs[uiInputId] = Number(uiInputValue);
      } else {
        // SLice of the quotes
        newNodeUiInputs.inputs[uiInputId] = uiInputValue.slice(1, -1);
      }

      newNodeUiInputs.changes.push(uiInputId);
    });

    // this.graphManager.updateUIInputs(
    //   graph.uuid,
    //   node.uuid,
    //   newNodeUiInputs,
    //   CoreGraphUpdateParticipant.ai
    // );
    graph.updateUIInputs(node.uuid, newNodeUiInputs);
  }

  private mapAnchorIdsToUuids(node: Node) {
    const nodeAnchors = node.getAnchors;
    const map = Object.entries(nodeAnchors).reduce((result, [key, value]) => {
      result[value.anchorId] = key;
      return result;
    }, {} as { [key: string]: UUID });
    return map;
  }
}

export type BlypescriptNodeParam = {
  name: string;
  aiCanUse: boolean;
  types: string[];
};

export class BlypescriptNode {
  constructor(
    public readonly plugin: string,
    public readonly name: string,
    public readonly signature: string,
    public readonly description: string,
    public readonly nodeInputs: BlypescriptNodeParam[],
    public readonly uiInputs: BlypescriptNodeParam[],
    public readonly nodeOutputs: BlypescriptNodeParam[]
  ) {}

  public toString(): string {
    const nodeInputStrings = this.nodeInputs.map((input) => {
      const types = input.types
        .map((type) => {
          return `N<${type}>`;
        })
        .join("| ");
      return `${input.name}: ${types}`;
    });
    const uiInputStrings = this.uiInputs
      .filter((input) => input.aiCanUse)
      .map((input) => {
        const types = input.types
          .map((type) => {
            return `${type}`;
          })
          .join(" | ");
        return `${input.name}: ${types}`;
      });
    const nodeOutputStrings = this.nodeOutputs.map((output) => {
      const types = output.types
        .map((type) => {
          return `N<${type}>`;
        })
        .join(" | ");
      return `${output.name}: ${types}`;
    });

    const nodeParams = [...nodeInputStrings, ...uiInputStrings].join(", ");
    const nodeReturn = nodeOutputStrings.join(", ");
    // let str = `// ${this.description}\n${this.name}(${nodeParams}) => { ${nodeReturn} }`;
    const str = `${this.name}: (${nodeParams}) => ${
      nodeReturn ? "{ " + nodeReturn + " }" : "void"
    }`;

    return str;
  }
}

export class BlypescriptPlugin {
  constructor(public readonly name: string, public readonly nodes: BlypescriptNode[]) {}

  public static fromPluginNodeInstances(
    pluginName: string,
    nodes: NodeInstance[]
  ): BlypescriptPlugin {
    const blypescriptNodes = nodes.map((nodeInstance) => {
      const { name, plugin, description, signature } = nodeInstance;
      const nodeInputs = this.generateNodeInputs(nodeInstance);
      const uiInputs = this.generateUiInputs(nodeInstance.ui);
      const nodeOutputs = this.generateNodeOutputs(nodeInstance);

      return new BlypescriptNode(
        plugin,
        name,
        signature,
        description,
        nodeInputs,
        uiInputs,
        nodeOutputs
      );
    });

    return new BlypescriptPlugin(pluginName, blypescriptNodes);
  }

  public toString(): string {
    let str = `interface ${this.name} {\n`;

    this.nodes.forEach((node) => {
      str += `${node
        .toString()
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n")}\n`;
    });

    return str + "}";
  }

  public findNode(signature: string): BlypescriptNode | null {
    return this.nodes.find((node) => node.signature === signature) || null;
  }

  private static generateNodeInputs(node: NodeInstance): BlypescriptNodeParam[] {
    return node.inputs.map((input) => {
      return {
        name: input.id,
        aiCanUse: true,
        types: [input.type ? input.type : "any"],
      };
    });
  }

  private static generateUiInputs(ui: NodeUI | null): BlypescriptNodeParam[] {
    if (!ui) {
      return [];
    }

    if (ui.type === "parent") {
      return ui.params.flatMap((child) => this.generateUiInputs(child as NodeUI));
    } else if (ui.type === "leaf") {
      const props = ui.params[0];
      const componentType = (ui as NodeUILeaf)?.category;

      if (!props) {
        throw new BaseError("Props not available on NodeUiLeaf");
      }

      if (!componentType) {
        throw new BaseError("Component type not available on NodeUiLeaf");
      }

      const nodeParam: BlypescriptNodeParam = {
        name: ui.label,
        aiCanUse: true,
        types: [],
      };

      if (componentType === "Button") {
        nodeParam.aiCanUse = false;
        nodeParam.types.push("string");
      } else if (componentType === "Slider") {
        nodeParam.types.push("number");
      } else if (componentType === "Knob") {
        nodeParam.types.push("number");
      } else if (componentType === "Dropdown") {
        const objectSchema = z.record(z.string(), z.string());
        const options = objectSchema.safeParse(props.options);

        if (!options.success) {
          throw new BaseError("Options on UI Dropdown is not a Record<string, string>");
        }

        nodeParam.types = Object.values(options.data).map((val) => `'${val}'`);
      } else if (componentType === "TextInput") {
        nodeParam.types.push("string");
      } else if (componentType === "ColorPicker") {
        // nodeParam.types.push("\`#${string}\`");
        nodeParam.types.push("color");
      } else if (componentType === "FilePicker") {
        nodeParam.aiCanUse = false;
        nodeParam.types.push("file");
      } else if (componentType === "Buffer") {
        nodeParam.aiCanUse = false;
        nodeParam.types.push("buffer");
      } else {
        throw new BaseError(`${componentType} UI component has not been implemented yet`);
      }

      return [nodeParam];
    }

    return [];
  }

  private static generateNodeOutputs(node: NodeInstance): BlypescriptNodeParam[] {
    return node.outputs.map((output) => {
      return {
        name: output.id,
        aiCanUse: true,
        types: [output.type ? output.type : "any"],
      };
    });
  }
}

export class BlypescriptToolbox {
  constructor(public readonly plugins: BlypescriptPlugin[]) {}

  public static fromToolbox(toolbox: ToolboxRegistry): Result<BlypescriptToolbox> {
    const pluginMap = new Map<string, NodeInstance[]>();

    // Group nodes by plugin
    Object.values(toolbox.getRegistry()).forEach((node) => {
      if (pluginMap.has(node.plugin)) {
        pluginMap.get(node.plugin)?.push(node);
      } else {
        pluginMap.set(node.plugin, [node]);
      }
    });

    const blypescriptPlugins: BlypescriptPlugin[] = [];

    try {
      pluginMap.forEach((nodes, plugin) => {
        blypescriptPlugins.push(BlypescriptPlugin.fromPluginNodeInstances(plugin, nodes));
      });
    } catch (error) {
      if (error instanceof BaseError) return { success: false, error };
    }

    return { success: true, data: new BlypescriptToolbox(blypescriptPlugins) };
  }

  public toString(): string {
    const pluginStrings = this.plugins.map((plugin) => plugin.toString());
    let str = "// Node output wrapper type\ntype N<T> = { value: T } | null;\n\n";
    str += pluginStrings.join("\n\n");
    return str;
  }

  public getPlugin(name: string): BlypescriptPlugin | null {
    return this.plugins.find((plugin) => plugin.name === name) || null;
  }

  public getNode(signature: string): BlypescriptNode | null {
    const plugin = this.getPlugin(signature.split(".")[0]);

    if (!plugin) return null;

    return plugin.findNode(signature);
  }
}

// ==================================================================
// HELPERS
// ==================================================================

export function castToError(err: unknown): Error {
  if (err instanceof Error) return err;

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(err);
  } catch {}

  const error = new Error(`This value was thrown as is, not through an Error: ${stringified}`);
  return error;
}

export function colorString(str: string, color: keyof typeof colors) {
  return `${colors[color]}${str}${colors.RESET}`;
}

const colors = {
  ORANGE: "\x1b[38;5;208m",
  GREEN: "\x1b[38;5;40m",
  RED: "\x1b[38;5;196m",
  LIGHT_BLUE: "\x1b[38;5;39m",
  BLUE: "\x1b[38;5;27m",
  RESET: "\x1b[0m",
} as const;
