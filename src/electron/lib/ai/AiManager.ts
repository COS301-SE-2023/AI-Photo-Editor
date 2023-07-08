import { join } from "path";
import { app } from "electron";
import fs from "fs";
import type { MainWindow } from "../api/apis/WindowApi";
import prompt from "electron-prompt";
import { error } from "console";
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { Interface } from "readline";
import { Blix } from "../Blix";
import { NodeInstance, ToolboxRegistry } from "../registries/ToolboxRegistry";

interface Nodes {
  name: string;
  description: string;
}
export class AiManager {
  private _path: string;
  private _mainWindow;
  private _context: Nodes[] = [];

  constructor(mainWindow: MainWindow) {
    this._mainWindow = mainWindow;
    this._path = join(app.getPath("userData"), "projects");
    if (!fs.existsSync(this._path)) {
      fs.mkdirSync(this._path);
    }
  }

  instantiate(toolbox: ToolboxRegistry): void {
    for (const index in toolbox.getRegistry()) {
      if (toolbox.hasOwnProperty(index)) {
        const node: NodeInstance = toolbox.getRegistry()[index];
        this._context.push({ name: node.getSignature, description: node.getDescription });
      }
    }
  }

  async sendPrompt() {
    //  Creates a prompt window for the user to input a prompt for the AI to respond to
    const prompt = await this.createInputWindow();
    if (prompt === "undefined") return;

    // Manipulate prompt
    const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0.3 });
    model.modelName = "text-ada-001";
    const res = await model.call(prompt);
    // console.log(res);
  }

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
