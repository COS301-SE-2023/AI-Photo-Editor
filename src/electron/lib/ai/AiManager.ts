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
import type { ResponseFunctions } from "./ai-cookbook";
import { type MainWindow } from "../api/apis/WindowApi";
import { app } from "electron";
import { join } from "path";
import { getSecret } from "../../utils/settings";
import type { ToastType } from "../../../shared/types";
// Refer to .env for api keys

const supportedLanguageModels = {
  OpenAI: "OpenAI",
} as const;

type Values<T> = T[keyof T];
type SupportedLanguageModel = Values<typeof supportedLanguageModels>;

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
    return supportedLanguageModels;
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
   * This function will retrieve a key from the electron storage.
   * If the user had set a key it will be returned otherwise they will be alerted.
   *
   * @param model The model specified by the user
   * @param displayError Boolean used to decide if notifications must been sent to the user.
   * @returns An object that specifies if the user had a previous key for the model and their other saved keys
   */
  retrieveKey(model: SupportedLanguageModel, displayError = true): string {
    const modelUpperCase = model.toUpperCase() as Uppercase<typeof model>;
    const key = getSecret(`${modelUpperCase}_API_KEY`);
    if (!key) {
      if (displayError) {
        this.handleNotification(`No ${model} key found`, "warn");
      }
      return "";
    }
    return key;
  }

  handleNotification(message: string, type: ToastType) {
    this._mainWindow?.apis.utilClientApi.showToast({ message, type });
  }

  /**
   * Sends prompt to ai and returns response
   * @param prompt Prompt to send to ai
   * @param graphId Id of the graph to send to ai
   * @returns Response from ai
   * */
  async sendPrompt(prompt: string, graphId: string, model?: SupportedLanguageModel) {
    let finalResponse = "";
    const llmGraph = getGraph(this.graphManager, graphId);

    model = "OpenAI";

    if (!supportedLanguageModels[model]) {
      return this.handleNotification(`The ${model} model is not currently supported`, "warn");
    }

    const superSecretKey = this.retrieveKey(model, true);

    // if (!superSecretKey) {
    //   // finalResponse = `No key found for the ${model} model.`;
    //   logger.warn(`No key found for the ${model} model.`);
    //   return;
    // }

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
