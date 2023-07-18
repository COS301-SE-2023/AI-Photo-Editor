import type { MainWindow } from "../api/apis/WindowApi";
import prompt from "electron-prompt";
import { error } from "console";
import { NodeInstance, ToolboxRegistry } from "../registries/ToolboxRegistry";
import type { ChildProcessWithoutNullStreams } from "child_process";
import { spawn } from "child_process";
import logger from "../../utils/logger";
// Refer to .env for api keys

//  TODO : Provide the graph context that will be given to ai as context

interface PromptContext {
  prompt: string;
  plugin: string[];
  nodes: string[];
  edges: string[];
}

const nodes = [
  {
    id: "jakd14",
    signature: "math-plugin.binary",
    inputs: [
      {
        id: "d2b6f0",
        type: "number",
      },
      {
        id: "7a8c9e",
        type: "number",
      },
    ],
    outputs: [
      {
        id: "b3e1f4",
        type: "number",
      },
    ],
  },
  {
    id: "3a2b1c",
    signature: "math-plugin.binary",
    inputs: [
      {
        id: "4f2e1d",
        type: "number",
      },
      {
        id: "8c7b6a",
        type: "number",
      },
    ],
    outputs: [
      {
        id: "e9d8c7",
        type: "number",
      },
    ],
  },
];

const edges = [
  {
    id: "kadjbg",
    from: "b3e1f4",
    to: "4f2e1d",
  },
  {
    id: "0d1e2f",
    from: "b3e1f4",
    to: "8c7b6a",
  },
];
/**
 *
 * Manages ai by storing context and handling prompt input
 * @param mainWindow Main window of blix application
 *
 * */
export class AiManager {
  private _mainWindow;
  private _pluginContext: string[] = [];
  private _childProcess: ChildProcessWithoutNullStreams | null = null;
  private _promptContext: PromptContext | null = null;

  constructor(mainWindow: MainWindow) {
    this._mainWindow = mainWindow;
  }

  /**
   *
   * Initializes context of ai with all the nodes in the toolbox
   * @param toolbox This is the blix toolbox registry that contains all the nodes
   *
   * */

  instantiate(toolbox: ToolboxRegistry): void {
    for (const index in toolbox.getRegistry()) {
      if (!toolbox.hasOwnProperty(index)) {
        const node: NodeInstance = toolbox.getRegistry()[index];
        this._pluginContext.push(node.getSignature + ": " + node.getDescription);
      }
    }
    //  console.log(this._pluginContext)

    const stringNodes: string[] = [];
    const stringEdges: string[] = [];

    for (const index of nodes) {
      stringNodes.push(JSON.stringify(index));
      stringEdges.push(JSON.stringify(index));
    }

    this._promptContext = {
      prompt: "This is a test prompt",
      plugin: this._pluginContext,
      nodes: stringNodes,
      edges: stringEdges,
    };
  }

  /**
   *
   * Creates prompt window for the user to input a prompt for the AI to respond to
   * @returns A promise that resolves with the prompt value
   */

  async getPrompt(): Promise<string> {
    //  Creates a prompt window for the user to input a prompt for the AI to respond to
    const request = await this.createInputWindow();
    if (request === "undefined") return "null";
    else return request;
  }

  /**
   *
   * Sends prompt to langchain and handles responses.
   *
   * */
  async sendPrompt() {
    if (this._promptContext === null) throw new Error("Prompt context is null");

    const request = await this.getPrompt();

    if (request === "null") return;

    this._promptContext.prompt = request;

    //  Creates a prompt window for the user to input a prompt for the AI to respond to
    this._childProcess = spawn("python3", ["src/electron/lib/ai/API.py"]);

    const dataToSend2 = JSON.stringify(this._promptContext);
    this._childProcess.stdin.write(dataToSend2 + "\n");

    this._childProcess.stdin.end();

    // Receive output from the Python script
    this._childProcess.stdout.on("data", (data) => {
      const result = data.toString();
      logger.info("Received from Python:", result);
    });

    // Handle errors
    this._childProcess.stderr.on("data", (data) => {
      const result = data.toString();
      logger.warn("Error executing Python script: ", result);
    });

    // Handle process exit
    this._childProcess.on("close", (code) => {
      if (code == null) logger.warn(`Python script exited with code null`);
      else logger.warn(`Python script exited with code ${code}`);
    });
  }

  /**
   *
   * @returns A promise that resolves with the prompt value
   */

  async createInputWindow(): Promise<string> {
    return new Promise((resolve, reject) => {
      prompt(
        {
          title: "AI Prompt",
          label: "Prompt:",
          value: "",
          inputAttrs: {
            type: "text",
          },
          type: "input",
          customStylesheet: "./assets/promptWindow.css",
          menuBarVisible: true,
          alwaysOnTop: true,
        },
        this._mainWindow
      )
        .then((r) => {
          if (r === null || r === "") {
            resolve("undefined"); // User cancelled
          } else {
            resolve(r); // Resolve with the prompt value
          }
        })
        .catch(error);
    });
  }
}
