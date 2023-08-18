import { CoreGraphManager } from "../../lib/core-graph/CoreGraphManager";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import { ToolboxRegistry } from "../../lib/registries/ToolboxRegistry";
import { CoreGraphUpdateParticipant } from "../../lib/core-graph/CoreGraphInteractors";
import { type CoreGraph, CoreNodeUIInputs, type Node } from "../../lib/core-graph/CoreGraph";
import type { INodeUIInputs } from "../../../shared/types";

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
    console.log(match);
    const extractedProgram = match[1];
    const statements = extractedProgram
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s || !s.startsWith("//"));
    // if (statements[0].match(/^\s*function\s*graph\s*\{\s*$/)?.length !== 0) {
    //   statements.shift()
    // }
    // if (statements[statements.length - 1].match(/^\s*\}\s*$/)) {
    //   statements.pop()
    // }
    statements.pop();
    statements.shift();
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
    const changed = other.statements.filter(
      (os) =>
        !removed.includes(os) &&
        !added.includes(os) &&
        !this.statements.some((ts) => os.checkEquals(ts))
    );
    // const changed = this.statements.filter(
    //   (ts) =>
    //     !removed.includes(ts) &&
    //     !added.includes(ts) &&
    //     !other.statements.some((os) => ts.checkEquals(os))
    // );
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
      console.log(colorString("//==========New Program Node Name Map==========//", "LIGHT_BLUE"));
      console.log(newProgram.nodeNameIdMap.entries());
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
      this.graphManager.removeNode(graphId, nodeId!, CoreGraphUpdateParticipant.ai);
    });

    // Add nodes
    added.forEach((statement) => {
      const nodeInstance = this.toolbox.getNodeInstance(statement.nodeSignature);
      const response = this.graphManager.addNode(
        graphId,
        nodeInstance,
        { x: 0, y: 0 },
        CoreGraphUpdateParticipant.ai
      );

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
        const response = this.graphManager.removeEdge(
          graph.uuid,
          edge.getAnchorTo,
          CoreGraphUpdateParticipant.ai
        );
        console.log(response);
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

      console.log(outputNodeId, outputNodeAnchorId);

      const fromNode = graph.getNodes[fromNodeUuid];
      const fromNodeAnchors = this.mapAnchorIdsToUuids(fromNode);
      const outputAnchorUuid = fromNodeAnchors[outputNodeAnchorId];
      const inputAnchorUuid = anchorsIdToUuid[anchorId];
      this.graphManager.addEdge(
        graph.uuid,
        outputAnchorUuid,
        inputAnchorUuid,
        CoreGraphUpdateParticipant.ai
      );
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
    console.log(uiInputs);

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

    this.graphManager.updateUIInputs(
      graph.uuid,
      node.uuid,
      newNodeUiInputs,
      CoreGraphUpdateParticipant.ai
    );
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
