import { NodeInstance, ToolboxRegistry } from "../registries/ToolboxRegistry";
import type { ChildProcessWithoutNullStreams } from "child_process";
import { spawn } from "child_process";
import logger from "../../utils/logger";
import { CoreGraphManager } from "../core-graph/CoreGraphManager";
import {
  cookUnsafeResponse,
  addNode,
  getGraph,
  removeNode,
  addEdge,
  removeEdge,
} from "./ai-cookbook";
import type { Response, ResponseFunctions } from "./ai-cookbook";
// Refer to .env for api keys

//  TODO : Provide the graph context that will be given to ai as context

/**
 *
 * Manages ai by storing context and handling prompt input
 * @param mainWindow Main window of blix application
 *
 * */
export class AiManager {
  private graphManager: CoreGraphManager;
  private toolboxRegistry: ToolboxRegistry;
  private _childProcess: ChildProcessWithoutNullStreams | null = null;

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

  /**
   * Sends prompt to ai and returns response
   * @param prompt Prompt to send to ai
   * @param graphId Id of the graph to send to ai
   * @returns Response from ai
   * */

  async sendPrompt(prompt: string, graphId: string) {
    let finalResponse = "";
    const llmGraph = getGraph(this.graphManager, graphId);

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
    childProcess.stdout.on("data", (buffer: Buffer) => {
      const data = buffer.toString();
      logger.info("Received from Python: ", data);

      try {
        const res = cookUnsafeResponse(JSON.parse(data));

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
      return removeNode(this.graphManager, graphId, args);
    } else if (name === "addEdge") {
      return addEdge(this.graphManager, graphId, args);
    } else if (name === "removeEdge") {
      return removeEdge(this.graphManager, graphId, args);
    }

    // It should never reach here
    return {
      status: "error",
      message: "Something went wrong in magic wand",
    };
  }
}
