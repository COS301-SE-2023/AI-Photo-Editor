import { NodeInstance, ToolboxRegistry } from "../registries/ToolboxRegistry";
import type { ChildProcessWithoutNullStreams } from "child_process";
import { spawn } from "child_process";
import logger from "../../utils/logger";
import { CoreGraphManager } from "../core-graph/CoreGraphManager";
import {
  CoreGraphExporter,
  LLMExportStrategy,
  type LLMGraph,
} from "../core-graph/CoreGraphExporter";
import { type QueryResponse } from "@shared/types";
import { cookUnsafeResponse, addNode } from "./ai-cookbook";
import type { Response, ResponseFunctions } from "./ai-cookbook";
// Refer to .env for api keys

//  TODO : Provide the graph context that will be given to ai as context

interface PromptContext {
  prompt: string;
  plugin: string[];
  nodes: string[];
  edges: string[];
}

interface Edge {
  id: string;
  input: string;
  output: string;
}

/**
 *
 * Manages ai by storing context and handling prompt input
 * @param mainWindow Main window of blix application
 *
 * */
export class AiManager {
  private graphManager: CoreGraphManager;
  private toolboxRegistry: ToolboxRegistry;
  private _pluginContext: string[] = [];
  private _childProcess: ChildProcessWithoutNullStreams | null = null;
  private _promptContext: PromptContext | null = null;
  private currentGraph = "";
  private _exporter = new LLMExportStrategy();

  /**
   *
   * Initializes context of ai with all the nodes in the toolbox and the graph
   * @param toolbox This is the blix toolbox registry that contains all the nodes
   * @param graphManager This is the graph manager that manages the current graph
   *
   * */
  constructor(toolbox: ToolboxRegistry, graphManager: CoreGraphManager) {
    this.graphManager = graphManager;
    this.toolboxRegistry = toolbox;

    // console.log(this._pluginContext);

    // Need to bind dynamic function calls

    // this.sendPrompt();
    // console.log("Execute!")
    // console.log(this.graphManager.getAllGraphUUIDs());
  }

  pluginContext() {
    const pluginNodes: string[] = [];

    for (const index in this.toolboxRegistry.getRegistry()) {
      if (!this.toolboxRegistry.hasOwnProperty(index)) {
        const node: NodeInstance = this.toolboxRegistry.getRegistry()[index];
        pluginNodes.push(node.signature + ": " + node.description);
      }
    }

    return pluginNodes;
  }

  async sendPrompt(prompt: string, graphId: string) {
    this.currentGraph = graphId;
    let finalResponse = "";
    const graphExporter = new CoreGraphExporter(new LLMExportStrategy());
    const llmGraph = graphExporter.exportGraph(this.graphManager.getGraph(graphId));

    const promptContext = {
      prompt,
      nodes: llmGraph.graph.nodes,
      edges: llmGraph.graph.edges,
      plugin: this.pluginContext(),
    };

    const childProcess = spawn("python3", ["src/electron/lib/ai/python/main.py"]);

    const dataToSend = JSON.stringify(promptContext);
    childProcess.stdin.write(dataToSend + "\n");
    childProcess.stdin.write("end of transmission\n");

    // Receive output from the Python script
    childProcess.stdout.on("data", (data: Buffer) => {
      const dataStr = data.toString();
      logger.info("Received from Python: ", data);

      try {
        const res = cookUnsafeResponse(JSON.parse(dataStr));

        if (res.type === "exit") {
          logger.info("Response from python : ", res.message);
          finalResponse = res.message;
        } else if (res.type === "error") {
          throw res.message;
        } else if (res.type === "debug") {
          // Do something with debugging info
        } else if (res.type === "function") {
          const operationRes = this.executeMagicWand(res, graphId);
          const operationResStr = JSON.stringify(operationRes);
          logger.info("Blix response: ", operationResStr);
          childProcess.stdin.write(`${operationResStr}\n`);
          childProcess.stdin.write("end of transmission\n");
        }
      } catch (error) {
        // Something went horribly wrong
        this._childProcess?.kill();
        finalResponse = "Oops. Something went horribly wrong🫡The LLM is clearly a bot";
        logger.info("Python script error: ", JSON.stringify(error));
      }
    });

    // Handle errors
    childProcess.stderr.on("data", (data: Buffer) => {
      const result = data.toString();
      logger.warn("Error executing Python script: ", result);
    });

    // Handle process exit
    childProcess.on("close", (data: Buffer) => {
      const code = data.toString();
      if (code == null) logger.warn(`Python script exited with code null`);
      else logger.warn(`Python script exited with code ${code}`);
    });
  }

  executeMagicWand(config: ResponseFunctions, graphId: string) {
    const { name, args } = config;

    if (name === "addNode") {
      return addNode(this.graphManager, this.toolboxRegistry, graphId, args);
    } else if (name === "removeNode") {
      // Call cookbook method to removeNode here
    } else if (name === "addEdge") {
      // Call cookbook method to addEdge here
    } else if (name === "removeEdge") {
      // Call cookbook method to removeEdge here
    }

    // It should never reach here
    return {
      status: "error",
      message: "Something went wrong in magic wand",
    };
  }

  // TODO: Move to the cookbook
  removeNode(args: JSON): string {
    try {
      interface Args {
        id: string;
      }

      const obj = args as unknown as Args;

      const graph = this.getGraph();
      const { nodeMap } = graph;

      const fullId = nodeMap[obj.id];
      if (fullId === undefined)
        return this.errorResponse("The provided id is invalid :  id does not exist");

      this.graphManager.removeNode(this.currentGraph, fullId);
      return "Success, node removed successfully";
    } catch (error) {
      return this.errorResponse(error as string);
    }
  }

  /**
   *
   * Calls addEdge from coreGraphManager to add an edge to the graph
   * @param args Json object that contains the arguments for the addEdge function :
   * interface :
   * Args {
   * output : string
   * input : string
   * }
   *
   * @returns Returns a string that contains the response from the graphManager
   * */

  // TODO: Move to the cookbook
  addEdge(args: JSON): string {
    try {
      interface Args {
        output: string;
        input: string;
      }

      const obj = args as unknown as Args;
      const graph = this.getGraph();

      const { anchorMap } = graph;

      const output = anchorMap[obj.output];

      if (output === undefined) {
        throw new Error("Output anchor does not exist");
      }
      const input = anchorMap[obj.input];

      const response = this.graphManager.addEdge(this.currentGraph, input, output);
      return JSON.stringify(response);
    } catch (error) {
      // Manual error to give ai
      return this.errorResponse(error as string);
    }
  }

  /**
   * Finds an edge object based on its id
   * @param edges Interface that holds edge id, input anchor id and output anchor id
   * @param id Id of the edge to be found
   * @returns The edge that was found, or returns undefined
   * */

  // TODO: Move to the cookbook
  findEdgeById(edges: Edge[], id: string): Edge | undefined {
    return edges.find((edge) => edge.id === id);
  }

  /**
   *
   * Calls removeEdge from coreGraphManager to remove an edge from the graph, id of edge is provided.
   * @param args Json object that contains the arguments for the removeEdge function :
   * interface :
   * Args {
   * id : string
   * }
   *
   * @returns Returns a string that contains the response from the graphManager
   * */

  // TODO: Move to the cookbook
  removeEdge(args: JSON): string {
    try {
      interface Args {
        id: string;
      }

      const obj = args as unknown as Args;
      const graph = this.getGraph();
      const edge = this.findEdgeById(graph.graph.edges, obj.id);

      if (edge) {
        const graph = this.getGraph();

        const { anchorMap } = graph;
        const anchor = anchorMap[edge?.input];
        try {
          this.graphManager.removeEdge(this.currentGraph, anchor);
          return "Success, edge removed successfully";
        } catch (error) {
          return error as string;
        }
      } else return "The given edge does not exist";
    } catch (error) {
      // Manual error to give ai
      return "Critical error : Something went completely wrong, terminate execution.";
    }
  }

  // TODO: Move to the cookbook
  getGraph(): LLMGraph {
    return this._exporter.export(this.graphManager.getGraph(this.currentGraph));
  }

  // TODO: Move to the cookbook
  truncId(arr: string[]): string[] {
    return arr.map((str) => str.slice(0, 6));
  }

  // TODO: Move to the cookbook
  errorResponse(message: string): string {
    const response: QueryResponse = {
      status: "error",
      message,
    };
    return JSON.stringify(response);
  }
}
