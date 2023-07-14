import { join } from "path";
import { app } from "electron";
import fs from "fs";
import type { MainWindow } from "../api/apis/WindowApi";
import prompt from "electron-prompt";
import { error } from "console";
import { OpenAI } from "langchain/llms/openai";
import { NodeInstance, ToolboxRegistry } from "../registries/ToolboxRegistry";
import { PromptTemplate } from "langchain/prompts";

// Refer to .env for api keys

//  TODO : Provide the graph context that will be given to ai as context

// interface Nodes {
//   name: string;
//   description: string;
// }

const graph = {
  nodes: [
    {
      inputAnchors: [
        {
          id: 1,
          type: "number",
        },
      ],
      outputAnchors: [
        {
          id: 2,
          type: "number",
        },
      ],
      signature: "input-plugin.number",
    },
    {
      id: 2,
      signature: "input-plugin.number",
      inputs: [],
      outputs: [3],
    },
    {
      id: 3,
      signature: "math-plugin.binary",
      inputs: [1, 2],
      outputs: [5],
    },
    {
      id: 5,
      signature: "input-plugin.number",
      inputs: [3],
      outputs: [6],
    },
    {
      id: 6,
      signature: "math-plugin.binary",
      inputs: [5],
      outputs: [],
    },
    {
      id: 4,
      signature: "output-plugin.print",
      inputs: [],
      outputs: [],
    },
  ],
};

/**
 *
 * Manages ai by storing context and handling prompt input
 * @param mainWindow Main window of blix application
 *
 * */
export class AiManager {
  private _path: string;
  private _mainWindow;
  private _context: string[] = [];

  constructor(mainWindow: MainWindow) {
    this._mainWindow = mainWindow;
    this._path = join(app.getPath("userData"), "projects");
    if (!fs.existsSync(this._path)) {
      fs.mkdirSync(this._path);
    }
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
        this._context.push(node.getSignature + ": " + node.getDescription);
      }
    }
    // console.log(this._context);
  }

  /**
   *
   * Creates prompt window for the user to input a prompt for the AI to respond to
   */

  async sendPrompt() {
    //  Creates a prompt window for the user to input a prompt for the AI to respond to
    const request = await this.createInputWindow();
    if (request === "undefined") return;

    const template =
      "Provided is the following graph : {graph}. This graph consists of nodes that have specific functionality. The list of available nodes are : {nodes} Using the provided information, {request}";

    const prompt = new PromptTemplate({
      inputVariables: ["graph", "nodes", "request"],
      template,
    });

    const res = await prompt.format({
      graph: JSON.stringify(graph) + "\n" + "\n",
      nodes: this._context.toLocaleString() + "\n" + "\n",
      request,
    });

    // console.log(res);

    // console.log(res);
    // Manipulate prompt
    // const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0.1 });
    // model.modelName = "text-ada-001";
    // const res = await model.call(prompt);
    // console.log(res);
  }

  /**
   *
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
          if (r === null) {
            resolve("undefined"); // User cancelled
          } else {
            resolve(r); // Resolve with the prompt value
          }
        })
        .catch(error);
    });
  }
}
