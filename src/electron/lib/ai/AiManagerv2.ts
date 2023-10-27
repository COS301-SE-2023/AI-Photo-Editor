/* eslint-disable no-console */
import { type Message, Chat } from "./Chat";
import { type ChatModel, Model, type ModelResponse } from "./Model";

import { NodeInstance, ToolboxRegistry } from "../registries/ToolboxRegistry";
import { CoreGraphManager } from "../core-graph/CoreGraphManager";
import type { MainWindow } from "../api/apis/WindowApi";
import {
  BlypescriptExportStrategy,
  CoreGraphExporter,
} from "../../lib/core-graph/CoreGraphExporter";
import { readFileSync, writeFileSync } from "fs";
import path, { join } from "path";
import logger from "../../utils/logger";
import {
  BlypescriptProgram,
  type AiLangDiff,
  BlypescriptInterpreter,
  BlypescriptToolbox,
  type Result,
  colorString,
  type Colors,
} from "./AiLang";
import {
  CoreGraphUpdateEvent,
  CoreGraphUpdateParticipant,
} from "../../lib/core-graph/CoreGraphInteractors";
import { generateGuidePrompt } from "./prompt";
import { app } from "electron";
import fs from "fs";

type PromptOptions = {
  prompt: string;
  graphId: string;
  messages?: Message[];
  model?: ChatModel;
  apiKey: string;
  chatId?: string;
  verbose?: boolean;
};

export const genericErrorResponse = "I struggled to understand that, can you try again?";

export class AiManager {
  private graphExporter: CoreGraphExporter<BlypescriptProgram>;
  private readonly chats: Chat[] = [];
  private blypescriptInterpreter: BlypescriptInterpreter;
  private blypescriptToolbox: BlypescriptToolbox;
  private agentIterationLimit = 2;

  constructor(
    private readonly toolbox: ToolboxRegistry,
    private readonly graphManager: CoreGraphManager,
    private readonly mainWindow?: MainWindow
  ) {
    this.blypescriptToolbox = BlypescriptToolbox.fromToolbox(this.toolbox);
    this.graphExporter = new CoreGraphExporter(
      new BlypescriptExportStrategy(this.blypescriptToolbox)
    );
    this.blypescriptInterpreter = new BlypescriptInterpreter(toolbox, graphManager);
  }

  async executePrompt({ prompt, graphId, model, apiKey, chatId, verbose }: PromptOptions) {
    this.blypescriptToolbox = BlypescriptToolbox.fromToolbox(this.toolbox);
    this.graphExporter = new CoreGraphExporter(
      new BlypescriptExportStrategy(this.blypescriptToolbox)
    );
    // console.log(this.blypescriptToolbox.toString());
    const blypescriptProgram = this.graphExporter.exportGraph(this.graphManager.getGraph(graphId));
    this.blypescriptInterpreter = new BlypescriptInterpreter(this.toolbox, this.graphManager);

    let chat = this.chats.find((chat) => chat.id === chatId);

    if (!chat) {
      chat = new Chat();
      this.chats.push(chat);
    }

    const messages: Message[] = [
      {
        role: "system",
        content: generateGuidePrompt({
          interfaces: this.blypescriptToolbox.toString(),
        }),
      },
      {
        role: "user",
        content: `Current Graph: \n\`\`\`typescript\n${blypescriptProgram.toString()}\n\`\`\``,
      },
      {
        role: "user",
        content: `User: ${prompt}\n\nAI:`,
      },
    ];

    chat.addMessages(messages);

    const llm = Model.create({ model: model || "GPT-3.5", apiKey, temperature: 0.05 });

    for (let i = 0; i < this.agentIterationLimit; i++) {
      const response = await llm.generate(chat);

      if (!response.success) {
        logger.error(response.error, response.message);
        return response;
      }

      chat.addMessage({ role: "assistant", content: response.data.content });
      // console.log(chat.getMessages())
      // console.log(response.data.content)

      const matchFinalAnswer = response.data.content.match(/.*Final_Answer:(.*)/);

      if (matchFinalAnswer) {
        this.writeChatToDisk(chat, model);
        return {
          success: true,
          message: matchFinalAnswer[1],
          data: {
            chatId: chat.id,
            lastResponse: response.data.content,
          },
        } satisfies Result;
      }

      const result = BlypescriptProgram.fromString(response.data.content, this.blypescriptToolbox);

      if (!result.success) {
        logger.error(result.error, result.message);
        chat.addMessage({ role: "blix", content: `Error: ${result.message}` });
        continue; // retry if failure
      }

      const newBlypescriptProgram = result.data;

      try {
        // cant return Result interface in constructor, this function will only break if we are bozo anyway
        const result = this.blypescriptInterpreter.run(
          graphId,
          blypescriptProgram,
          newBlypescriptProgram,
          true
        );

        if (!result.success) {
          logger.error(result.error, result.message);
          chat.addMessage({ role: "blix", content: `Error: ${result.message}` });
          continue; // retry if failure
        }

        // this.graphManager.onGraphUpdated(
        //   graphId,
        //   new Set([CoreGraphUpdateEvent.graphUpdated, CoreGraphUpdateEvent.uiInputsUpdated]),
        //   CoreGraphUpdateParticipant.ai
        // );

        this.writeChatToDisk(chat, model);
        return {
          success: true,
          message: "Successfully made changes to the graph.",
          data: {
            chatId: chat.id,
            lastResponse: response.data.content,
          },
        } satisfies Result;
      } catch (error) {
        logger.error(error);

        return {
          success: false,
          error: "Something very bad went wrong",
          message: error instanceof Error ? error.message : "Some unknown error occurred.",
        } satisfies Result;
      }
    }

    this.writeChatToDisk(chat, model);

    return {
      success: false,
      error: "Chat iteration limit reached",
      message: genericErrorResponse,
      data: {
        chatId: chat.id,
      },
    } satisfies Result;
  }

  private writeChatToDisk(chat: Chat, model: string | undefined) {
    try {
      const filePath = path.join(app.getPath("userData"), "chats.json");

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        // Read the existing JSON data
        const jsonData = fs.readFileSync(filePath, "utf8");
        const chatsData = JSON.parse(jsonData);

        chatsData.chats.push({
          timestamp: Date.now(),
          model,
          messages: chat.getMessages(),
        });

        // Write the updated JSON data back to file
        fs.writeFileSync(filePath, JSON.stringify(chatsData));
      } else {
        const initialData = {
          chats: [
            {
              timestamp: Date.now(),
              messages: chat.getMessages(),
            },
          ],
        };
        fs.writeFileSync(filePath, JSON.stringify(initialData));
      }
    } catch (error) {
      logger.warn("Something is wrong with chats file");
    }
  }

  private getGraphExamples() {
    return readFileSync(join(__dirname.replace("build", "src"), "examples.txt"), "utf8").toString();
  }

  private log(message: string, color: Colors) {
    console.log(colorString(message, color));
  }

  public getChat(id: string) {
    return this.chats.find((chat) => chat.id === id) || null;
  }
}

export function measurePerformance<T>(
  func: (...args: any[]) => T,
  ...params: any[]
): { result: T; time: number } {
  const startTime = performance.now();
  // eslint-disable-next-line
  const result = func(...params);
  const endTime = performance.now();
  const elapsedTime = endTime - startTime;
  return { result, time: elapsedTime };
}
