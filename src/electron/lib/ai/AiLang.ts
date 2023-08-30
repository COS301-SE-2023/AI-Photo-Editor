import { CoreGraphManager } from "../../lib/core-graph/CoreGraphManager";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import { NodeInstance, ToolboxRegistry } from "../../lib/registries/ToolboxRegistry";
import { CoreGraphUpdateParticipant } from "../../lib/core-graph/CoreGraphInteractors";
import { type CoreGraph, CoreNodeUIInputs, type Node } from "../../lib/core-graph/CoreGraph";
import type { INodeUIInputs } from "../../../shared/types";
import { NodeUI, NodeUILeaf } from "../../../shared/ui/NodeUITypes";
import { z } from "zod";
import logger from "../../utils/logger";

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

  public static fromString(program: string): Result<BlypescriptProgram> {
    const nodeNameIdMap = new Map<string, UUID>();
    const match = program.match(/^.*function\s*graph\(\)\s*{([\s\S]*)}.*$/s);

    // Does not conform to syntax
    if (!match)
      return {
        success: false,
        error: "Program does not conform to syntax",
        message: "Incorrect syntax provided for Blypescript program",
      };

    const extractedProgram = match[1];
    const statements = extractedProgram
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s || !s.startsWith("//"));
    const resStatements = [];
    const usedNodeIds = new Set<string>();

    for (let s = 0; s < statements.length; s++) {
      if (statements[s].length === 0 || statements[s].startsWith("//")) continue;

      const result = BlypescriptStatement.fromString(statements[s]);

      // TODO: Fail + return error message to the AI when a statement is invalid
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          message: result.message + "on line " + (s + 1).toString(),
        };
      } // Invalid statement

      const statement = result.data;
      // Duplicate nodeId

      if (usedNodeIds.has(statement.name)) {
        return {
          success: false,
          error: "Duplicate nodeId",
          message: "Duplicate nodeId provided on line " + (s + 1).toString(),
        };
      }

      nodeNameIdMap.set(statement.name, "");
      statement.lineNumber = s;
      resStatements.push(statement);
      usedNodeIds.add(statement.name);
    }

    const prog = new BlypescriptProgram(resStatements, nodeNameIdMap);

    return { success: true, data: prog };
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

  public static fromString(statement: string): Result<BlypescriptStatement> {
    const match = statement.match(BlypescriptStatementRegex);
    if (match) {
      const statement = new BlypescriptStatement(
        match[1],
        `${match[2]}.${match[3]}`,
        // TODO: Look into being a bit smarter about checking/storing input 'arguments'
        match[4].split(",").map((s) => s.trim())
      );

      return { success: true, data: statement };
    }
    return {
      success: false,
      error: "Invalid statement provided",
      message: "Invalid syntax for statementS",
    };
  }

  public toString(): string {
    return `var ${this.name} = ${this.nodeSignature}(${this.nodeInputs.join(", ")});`;
  }
}
export class BlypescriptInterpreter {
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
  ): Result<null, null> {
    const graph = this.graphManager.getGraph(graphId);
    const { added, removed, changed } = oldProgram.diff(newProgram);
    newProgram.addNodeIds(oldProgram);

    if (verbose) {
      logger.warn(colorString("//==========Old Program==========//", "ORANGE"));
      logger.warn(oldProgram.toString());
      logger.warn(colorString("//==========New Program==========//", "GREEN"));
      logger.warn(newProgram.toString());
      logger.warn(colorString("//==========Diff==========//", "LIGHT_BLUE"));
      logger.warn(JSON.stringify({ added, removed, changed }, null, 2));
    }

    // Remove nodes
    removed.forEach((statement) => {
      const nodeId = oldProgram.nodeNameIdMap.get(statement.name);
      // this.graphManager.removeNode(graphId, nodeId!, CoreGraphUpdateParticipant.ai);
      graph.removeNode(nodeId!);
    });

    let result: Result<null, null>;
    result = { success: true, data: null };
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
        result = {
          success: false,
          error: "Error while adding node to graph",
          message: response.message,
        };
        return;
      }

      newProgram.nodeNameIdMap.set(statement.name, response.data.nodeId);
    });

    if (!result.success) return result;

    // Change edges and ui inputs
    // Optimizations can be made to treat added edges and changed edges differently
    [...added, ...changed].forEach((statement) => {
      const nodeId = newProgram.nodeNameIdMap.get(statement.name);
      const node = graph.getNodes[nodeId || ""];

      if (!node) {
        result = {
          success: false,
          error: "Node id not defined in changed statements",
          message: "Node not found in graph",
        };
        return;
      }

      result = this.changeEdges(node, graph, statement, newProgram); // will return success = false if something went wrong
      if (!result.success) return;

      result = this.changeUiInputs(node, graph, statement); // will return success = false if something went wrong
      return;
    });

    return result; // will return success = true if everything went well
  }

  // Improve so that it checks if edge should actually be changed
  private changeEdges(
    node: Node,
    graph: CoreGraph,
    statement: AiLangStatement,
    program: BlypescriptProgram
  ): Result<null, null> {
    const blypescriptNode = this.blypescriptToolbox.getNode(statement.nodeSignature);
    let result: Result<null, null>;
    result = { success: true, data: null };

    if (!blypescriptNode) {
      return {
        success: false,
        error: "Node instance not found when changing edges",
        message: "Node not found in toolbox when changing edges",
      };
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
        const response = graph.removeEdge(edge.getAnchorTo);
        // TODO: Handle response
        // Not sure if should end function here or continue
        if (response.status === "error") {
          result = {
            success: false,
            error: "Error removing edge from graph",
            message: response.message,
          };
          return;
        }
      }

      if (anchorInput === "null") {
        return;
      }

      const match = anchorInput.match(/^(.*)\['(.*)'\]$/);

      if (!match) {
        result = {
          success: false,
          error: "Error matching anchor parameters when changing edges",
          message: "Could not match anchor parameters when changing edges",
        };
        return;
      }

      const [_, outputNodeId, outputNodeAnchorId] = match;

      if (!outputNodeId || !outputNodeAnchorId) {
        // Prolly means language model added primitive instead of connecting input edge
        result = {
          success: false,
          error: "Error matching anchor parameters when changing edges",
          message: "Could not match anchor parameters when changing edges",
        };
        return;
      }

      const fromNodeUuid = program.nodeNameIdMap.get(outputNodeId);

      if (!fromNodeUuid) {
        result = {
          success: false,
          error: "Error retrieving output node id from program map",
          message: "Could not retrieve output node id from program map",
        };
        return;
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
    // logger.warn(uiInputs)

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

    // logger.warn(graph.getUIInputs(node.uuid));
    // logger.warn()
    return result;
  }

  private changeUiInputs(
    node: Node,
    graph: CoreGraph,
    statement: AiLangStatement
  ): Result<null, null> {
    const blypescriptNode = this.blypescriptToolbox.getNode(statement.nodeSignature);
    const uiInputs = graph.getUIInputs(node.uuid);

    if (!uiInputs || !blypescriptNode) {
      return {
        success: false,
        error: "Error finding node ui inputs",
        message: "Missing input arguments",
      };
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
    return { success: true, data: null };
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
  ): Result<BlypescriptPlugin> {
    const blypescriptNodes = nodes.map((nodeInstance) => {
      const { name, plugin, description, signature } = nodeInstance;
      const nodeInputs = this.generateNodeInputs(nodeInstance);
      const uiInputsResult = this.generateUiInputs(nodeInstance.ui);
      const nodeOutputs = this.generateNodeOutputs(nodeInstance);

      if (!uiInputsResult.success) {
        return uiInputsResult satisfies Result;
      }

      return {
        success: true,
        data: new BlypescriptNode(
          plugin,
          name,
          signature,
          description,
          nodeInputs,
          uiInputsResult.data,
          nodeOutputs
        ),
      } satisfies Result;
    });

    const failedResults = blypescriptNodes.filter((result) => !result.success);

    if (failedResults.length > 0) {
      // Maybe improve to return list of errors
      return {
        success: false,
        error: "Something went wrong when creating BlypescriptNode",
        message: "Error when creating Blypescript Plugin",
      };
    }

    return {
      success: true,
      data: new BlypescriptPlugin(
        pluginName,
        blypescriptNodes.map((result) => result.data as BlypescriptNode)
      ),
    };
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

  private static generateUiInputs(ui: NodeUI | null): Result<BlypescriptNodeParam[]> {
    if (!ui) {
      return { success: true, data: [] };
    }

    if (ui.type === "parent") {
      const results = ui.params.flatMap((child) => this.generateUiInputs(child as NodeUI));
      const failedResults = results.filter((result) => !result.success);

      if (failedResults.length > 0) {
        // Maybe improve to return list of errors
        return failedResults[0];
      }

      return {
        success: true,
        data: results.flatMap((result) => result.data as BlypescriptNodeParam[]),
      };
    } else if (ui.type === "leaf") {
      const props = ui.params[0];
      const componentType = (ui as NodeUILeaf)?.category;

      if (!props) {
        return {
          success: false,
          error: "Error generating UI Inputs",
          message: "Props not available on NodeUiLeaf",
        };
      }

      if (!componentType) {
        return {
          success: false,
          error: "Error generating UI Inputs",
          message: "Component type not available on NodeUiLeaf",
        };
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
          return {
            success: false,
            error: "Error generating UI Inputs",
            message: "Options on UI Dropdown is not a Record<string, string>",
          };
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
        return {
          success: false,
          error: "Error generating UI Inputs",
          message: `${componentType} UI component has not been implemented yet`,
        };
      }

      return { success: true, data: [nodeParam] };
    }

    return { success: true, data: [] };
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

  public static fromToolbox(toolbox: ToolboxRegistry) {
    const pluginMap = new Map<string, NodeInstance[]>();

    // Group nodes by plugin
    Object.values(toolbox.getRegistry()).forEach((node) => {
      if (pluginMap.has(node.plugin)) {
        pluginMap.get(node.plugin)?.push(node);
      } else {
        pluginMap.set(node.plugin, [node]);
      }
    });

    const blypescriptPluginResults: Result<BlypescriptPlugin>[] = [];

    pluginMap.forEach((nodes, plugin) => {
      blypescriptPluginResults.push(BlypescriptPlugin.fromPluginNodeInstances(plugin, nodes));
    });

    const failedResults = blypescriptPluginResults.filter((result) => !result.success);

    if (failedResults.length > 0) {
      // Maybe improve to return list of errors
      return {
        success: false,
        error: "Something went wrong when creating BlypescriptPlugin",
        message: "Error when creating Blypescript Plugin",
      } satisfies Result;
    }

    const blypescriptPlugins: BlypescriptPlugin[] = blypescriptPluginResults.map(
      (result) => result.data as BlypescriptPlugin
    );

    return { success: true, data: new BlypescriptToolbox(blypescriptPlugins) } satisfies Result;
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

export type Result<T = unknown, E = unknown> =
  | { success: true; message?: string; data: T }
  | { success: false; error: string; message: string; data?: E };
