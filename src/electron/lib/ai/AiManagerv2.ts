/* eslint-disable no-console */
import { NodeInstance, ToolboxRegistry } from "../registries/ToolboxRegistry";
import { CoreGraphManager } from "../core-graph/CoreGraphManager";
import type { MainWindow } from "../api/apis/WindowApi";
import {
  BlypescriptExportStrategy,
  CoreGraphExporter,
} from "../../lib/core-graph/CoreGraphExporter";
import { readFileSync } from "fs";
import { join } from "path";
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
import { type Message, type Chat, type ChatModel, OpenAiChat, PalmChat, CHAT_MODELS } from "./Chat";
import { generateGuidePrompt } from "./prompt";

type PromptOptions = {
  prompt: string;
  graphId: string;
  messages?: Message[];
  model?: ChatModel;
  apiKey: string;
  chatId?: string;
  verbose?: boolean;
};

export const genericErrorResponse = "Oops, that wasn't supposed to happen🫠. Try again.";

export class AiManager {
  private readonly graphExporter: CoreGraphExporter<BlypescriptProgram>;
  private readonly blypescriptInterpreter: BlypescriptInterpreter;
  private readonly chats: Chat[] = [];

  constructor(
    private readonly toolbox: ToolboxRegistry,
    private readonly graphManager: CoreGraphManager,
    private readonly mainWindow?: MainWindow
  ) {
    this.graphExporter = new CoreGraphExporter(new BlypescriptExportStrategy(toolbox));
    this.blypescriptInterpreter = new BlypescriptInterpreter(toolbox, graphManager);
  }

  async executePrompt({ prompt, graphId, model, apiKey, chatId, verbose }: PromptOptions) {
    const chat = this.getChat({ id: chatId, model });

    const blypescriptProgram = this.graphExporter.exportGraph(this.graphManager.getGraph(graphId));
    const blypescriptToolboxResult = this.getBlypescriptToolbox();

    if (!blypescriptToolboxResult.success) {
      if (verbose) this.log(blypescriptToolboxResult.message, "RED");
      return {
        success: false,
        error: blypescriptToolboxResult.error,
        message: genericErrorResponse,
      } satisfies Result;
    }

    const messages: Message[] = [
        {
          role: "system",
          content: generateGuidePrompt({ interfaces: blypescriptToolboxResult.data.toolbox.toString() }),
        },
        {
          role: "user",
          content: `CURRENT GRAPH: \n\`\`\`ts\n${blypescriptProgram.toString()}\n\`\`\``,
        },
    ];

    chat.addMessages(messages);

    while (chat.iteration < chat.iterationLimit) {
      const response = await chat.generate(prompt, apiKey);

      if (!response.success) {
        return {
          success: false,
          error: response.code,
          message: response.message,
        } satisfies Result;
      }

      console.log(response.lastResponse)

      const result = BlypescriptProgram.fromString(response.lastResponse);

      if (!result.success) {
        console.log(result.message)
        console.log(result.error)
        chat.addMessage({ role: "blix", content: result.message });
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
          logger.warn(result.error);
          chat.addMessage({ role: "blix", content: `USER'S RESPONSE:\n${result.message}` });
          continue; // retry if failure
        }

        this.graphManager.onGraphUpdated(
          graphId,
          new Set([CoreGraphUpdateEvent.graphUpdated, CoreGraphUpdateEvent.uiInputsUpdated]),
          CoreGraphUpdateParticipant.ai
        );

        return {
          success: true,
          data: {
            messages: chat.getMessages(),
          },
        } satisfies Result;
      } catch (error) {
        logger.warn(error);

        return {
          success: false,
          error: "Something very bad went wrong",
          message: error instanceof Error ? error.message : "Some unknown error occurred.",
        } satisfies Result;
      }
    }

    return {
      success: false,
      error: "Chat iteration limit reached",
      message: genericErrorResponse,
    } satisfies Result;
  }

  getBlypescriptToolbox() {
    const { result, time } = measurePerformance(BlypescriptToolbox.fromToolbox, this.toolbox);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: {
        toolbox: result.data,
        time,
      },
    } satisfies Result;
  }

  /**
   * Will retrieve a specific chat. If you no ID is specified or Chat doesn't
   * exist then a new Chat will generated.
   *
   * @param id Chat ID
   */
  getChat({ id, model }: { id?: string; model?: ChatModel }): Chat {
    const chat = this.chats.find((chat) => chat.id === id);

    if (chat) return chat;

    model = model ?? "GPT-3.5";

    switch (model) {
      case "GPT-3.5":
      case "GPT-3.5-16K":
      case "GPT-4":
      case "GPT-4-32K":
        return new OpenAiChat({ model: CHAT_MODELS[model] });
      
      case "PaLM-Chat-Bison":
        return new PalmChat({ model: CHAT_MODELS[model] });
    }
  }

  private getGraphExamples() {
    return readFileSync(join(__dirname.replace("build", "src"), "examples.txt"), "utf8").toString();
  }

  private log(message: string, color: Colors) {
    console.log(colorString(message, color));
  }
}

function measurePerformance<T>(
  func: (...args: any[]) => T,
  ...params: any[]
): { result: T; time: number } {
  const startTime = performance.now();
  const result = func(...params);
  const endTime = performance.now();
  const elapsedTime = endTime - startTime;
  return { result, time: elapsedTime };
}
