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
  type ErrorResponse,
  type SuccessResponse,
} from "./AiLang";
import {
  CoreGraphUpdateEvent,
  CoreGraphUpdateParticipant,
} from "../../lib/core-graph/CoreGraphInteractors";
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
  private agentIterationLimit = 5;

  constructor(
    private readonly toolbox: ToolboxRegistry,
    private readonly graphManager: CoreGraphManager,
    private readonly mainWindow?: MainWindow
  ) {
    this.graphExporter = new CoreGraphExporter(new BlypescriptExportStrategy(toolbox));
    this.blypescriptInterpreter = new BlypescriptInterpreter(toolbox, graphManager);
  }

  async executePrompt({ prompt, graphId, model, apiKey, chatId, verbose }: PromptOptions) {
    const blypescriptProgram = this.graphExporter.exportGraph(this.graphManager.getGraph(graphId));
    const blypescriptToolboxResult = this.getBlypescriptToolbox();

    if (!blypescriptToolboxResult.success) {
      const errorResult = blypescriptToolboxResult as ErrorResponse;
      if (verbose) this.log(errorResult.message, "RED");
      return {
        success: false,
        error: errorResult.error,
        message: genericErrorResponse,
      } satisfies Result;
    } else {
      let chat = this.chats.find((chat) => chat.id === chatId);

      if (!chat) {
        chat = new Chat();
        this.chats.push(chat);
      }

      const messages: Message[] = [
        {
          role: "system",
          content: generateGuidePrompt({
            interfaces: blypescriptToolboxResult.data.toolbox.toString(),
          }),
        },
        {
          role: "user",
          content: `Current Graph: \n\`\`\`typescript\n${blypescriptProgram.toString()}\n\`\`\``,
        },
        {
          role: "user",
          content: `User: \n${prompt}\n\nAssistant:`,
        },
      ];

      chat.addMessages(messages);

      const llm = Model.create({ model: model || "GPT-3.5", apiKey, temperature: 0.05 });

      for (let i = 0; i < 2; i++) {
        const response = await llm.generate(chat);

        if (!response.success) return response;

        chat.addMessage({ role: "assistant", content: response.data.content });

        const matchFinalAnswer = response.data.content.match(/.*Final_Answer:(.*)/);

        if (matchFinalAnswer) {
          return {
            success: true,
            message: matchFinalAnswer[1],
            data: {
              chatId: chat.id,
              lastResponse: response.data.content,
            },
          } satisfies Result;
        }

        const result = BlypescriptProgram.fromString(
          response.data.content,
          blypescriptToolboxResult.data.toolbox
        );

        if (!result.success) {
          chat.addMessage({ role: "blix", content: `USER'S RESPONSE: ${result.message}` });
          continue; // retry if failure
        }

        const newBlypescriptProgram = result.data as BlypescriptProgram;

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

          // this.graphManager.onGraphUpdated(
          //   graphId,
          //   new Set([CoreGraphUpdateEvent.graphUpdated, CoreGraphUpdateEvent.uiInputsUpdated]),
          //   CoreGraphUpdateParticipant.ai
          // );

          return {
            success: true,
            message: "Successfully made changes to the graph.",
            data: {
              chatId: chat.id,
              lastResponse: response.data.content,
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
        data: {
          chatId: chat.id,
        },
      } satisfies Result;
    }
  }

  getBlypescriptToolbox(): Result<{ toolbox: BlypescriptToolbox; time: number }> | ErrorResponse {
    const { result, time } = measurePerformance(BlypescriptToolbox.fromToolbox, this.toolbox);

    if (!result.success) {
      const errorResult = result as ErrorResponse;
      return errorResult;
    }

    return {
      success: true,
      data: {
        toolbox: result.data,
        time,
      },
    } satisfies Result;
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
