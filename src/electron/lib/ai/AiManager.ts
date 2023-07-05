import { join } from "path";
import { app } from "electron";
import fs from "fs";
import type { MainWindow } from "../api/apis/WindowApi";
import prompt from "electron-prompt";
import { error } from "console";

export class AiManager {
  private _path: string;
  private _mainWindow;

  constructor(mainWindow: MainWindow) {
    this._mainWindow = mainWindow;
    this._path = join(app.getPath("userData"), "projects");
    if (!fs.existsSync(this._path)) {
      fs.mkdirSync(this._path);
    }
  }

  async sendPrompt() {
    //  Creates a prompt window for the user to input a prompt for the AI to respond to
    const prompt = this.createInputWindow();
  }

  async createInputWindow(): Promise<string | void> {
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
          // console.log('user cancelled');
          return r;
        } else {
          // console.log('result', r);
          return r;
        }
      })
      .catch(error);
  }
}
