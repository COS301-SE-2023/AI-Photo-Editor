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
import { type MainWindow } from "../api/apis/WindowApi";
import { app, safeStorage } from "electron";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
// Refer to .env for api keys

/**
 *
 * Manages ai by storing context and handling prompt input
 * @param toolbox This is the blix toolbox registry that contains all the nodes
 * @param graphManager This is the graph manager that manages the current graph
 * @param childProcess This is the child process that runs the python script
 *
 * */
export class AiManager {
  private _mainWindow?: MainWindow;
  private graphManager: CoreGraphManager;
  private toolboxRegistry: ToolboxRegistry;
  private _childProcess: ChildProcessWithoutNullStreams | null = null;
  private filePath = join(app.getPath("userData"), "secrets.json");
  private supportedModels: string[] = ["OpenAi"];
  // Maybe we want custom locations for the user? ^^
  /**
   *
   * Initializes context of ai with all the nodes in the toolbox and the graph
   * @param toolbox This is the blix toolbox registry that contains all the nodes
   * @param graphManager This is the graph manager that manages the current graph
   *
   * */
  constructor(toolbox: ToolboxRegistry, graphManager: CoreGraphManager, mainWindow?: MainWindow) {
    this.toolboxRegistry = toolbox;
    this.graphManager = graphManager;
    this._mainWindow = mainWindow;

    // console.log(this._pluginContext);

    // Need to bind dynamic function calls

    // this.sendPrompt();
    // console.log("Execute!")
    // console.log(this.graphManager.getAllGraphUUIDs());
  }

  public getSupportedModels() {
    return this.supportedModels;
  }

  public getFilePath() {
    return this.filePath;
  }

  pluginContext() {
    const pluginNodes: string[] = [];
    // console.log(this.toolboxRegistry)

    for (const index in this.toolboxRegistry.getRegistry()) {
      if (!this.toolboxRegistry.hasOwnProperty(index)) {
        const node: NodeInstance = this.toolboxRegistry.getRegistry()[index];
        pluginNodes.push(node.signature + ": " + node.description);
      }
    }

    return pluginNodes;
  }

  /**
   * This function will go to a local saved directory and retrieve encypted keys saved by the user.
   * If the user has never saved a key the file will then be created for them. The function checks the file to see if
   * there is a current key for the model and any other keys. These keys are then returned if they exist.
   *
   * @param model The model specified by the user
   * @param displayError Boolean used to decide if notifications must been sent to the user.
   * @returns An object that specifies if the user had a previous key for the model and their other saved keys
   */
  async retrieveKey(model: string, displayError = true): Promise<RetrieveKeyResponse> {
    let exists = true;
    // Retrieve locally encrypted keys
    if (!existsSync(this.filePath)) {
      // Create empty keys file if the user does not have one
      await writeFile(this.filePath, JSON.stringify({}));
    }
    const secrets: SuperSecretCredentials = JSON.parse(await readFile(this.filePath, "utf-8"));
    let key = "";
    if (model === "OPENAI") {
      key = secrets.OPENAI_API_KEY
        ? safeStorage.decryptString(Buffer.from(secrets.OPENAI_API_KEY))
        : "";
    }
    if (!key) {
      exists = false;
      if (displayError) this.handleNotification(`No ${model} key found`, "warn");
    }
    return { oldKey: exists, keys: secrets };
  }

  async handleNotification(message: string, type: NotificationTypes) {
    if (this._mainWindow) this._mainWindow.apis.utilClientApi.showToast({ message, type });
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

    const selectedModel = "OpenAi";
    if (!this.supportedModels.includes(selectedModel))
      return this.handleNotification(
        `The ${selectedModel} model is not currently supported`,
        "warn"
      );

    const superSecretKey = await this.retrieveKey(selectedModel.toUpperCase(), true);
    if (!superSecretKey) {
      finalResponse = `No key found for the ${selectedModel} model.`;
      logger.warn(`No key found for the ${selectedModel} model.`);
      return;
    }

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
      // console.log("Received from Python: ", data);

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
      return addNode(this.graphManager, this.toolboxRegistry.getRegistry(), graphId, args);
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
/**
 * All keys must follow this format used in this interface
 * {modelName}_API_KEY
 */
export interface SuperSecretCredentials {
  /* eslint-disable @typescript-eslint/naming-convention */
  OPENAI_API_KEY?: number[];
  // JAKE_API_KEY? : number[];
  // MORE_API_KEYS...
}

export interface RetrieveKeyResponse {
  oldKey: boolean;
  keys: SuperSecretCredentials;
}

export type NotificationTypes = "success" | "error" | "warn" | "info";
