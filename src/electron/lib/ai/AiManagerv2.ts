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
} from "./AiLang";
import {
  CoreGraphUpdateEvent,
  CoreGraphUpdateParticipant,
} from "../../lib/core-graph/CoreGraphInteractors";
import { type Message, type Chat, OpenAiChat } from "./Chat";

type PromptOptions = {
  prompt: string;
  graphId: string;
  messages?: Message[];
  model: "GPT-3.5" | "GPT-4";
  apiKey: string;
  chatId?: string;
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

  async executePrompt({ prompt, graphId, messages, model, apiKey, chatId }: PromptOptions) {
    const chat: Chat = this.chats.find((chat) => chat.id)
      ? this.chats.find((chat) => chat.id)!
      : new OpenAiChat(apiKey, { model: "gpt-3.5-turbo-0613" });

    const blypescriptProgram = this.graphExporter.exportGraph(this.graphManager.getGraph(graphId));

    if (!messages) {
      messages = [
        {
          role: "system",
          content: this.getGuidePrompt(),
        },
        {
          role: "system",
          content: `Interfaces allowed to be used: \n${this.getToolboxInterfaces()?.data || ""}}`,
        },
        {
          role: "system",
          content: `Example Graphs: \n${this.getGraphExamples()}}`,
        },
        {
          role: "user",
          content: `Current Graph: \n${blypescriptProgram.toString()}`,
        },
      ];
    }

    chat.addMessages(messages);
    chat.addMessage({ role: "user", content: prompt });

    while (chat.iteration < chat.iterationLimit) {
      const response = await chat.run();

      if (!response.success) {
        return {
          success: false,
          error: response.code,
          message: response.message,
        } satisfies Result;
      }

      const result = BlypescriptProgram.fromString(response.lastResponse);

      if (!result.success) {
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
          chat.addMessage({ role: "blix", content: result.message });
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

  private getGuidePrompt() {
    return readFileSync(
      join(__dirname.replace("build", "src"), "systemPrompt.txt"),
      "utf8"
    ).toString();
  }

  private getToolboxInterfaces() {
    // return readFileSync(
    //   join(__dirname.replace("build", "src"), "interfaces.txt"),
    //   "utf8"
    // ).toString();

    const response = BlypescriptToolbox.fromToolbox(this.toolbox);

    if (!response.success) {
      // TODO: Handle error here
      return response;
    }

    return {
      success: true,
      data: response.data.toString(),
    } satisfies Result;
  }

  private getGraphExamples() {
    return readFileSync(join(__dirname.replace("build", "src"), "examples.txt"), "utf8").toString();
  }
}
