import { NodeInstance, ToolboxRegistry } from "../registries/ToolboxRegistry";
import { CoreGraphManager } from "../core-graph/CoreGraphManager";
import type { MainWindow } from "../api/apis/WindowApi";
import { Configuration, OpenAIApi } from "openai";
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
} from "./AiLang";
import type { Result } from "./AiLang";
import dotenv from "dotenv";
import {
  CoreGraphUpdateEvent,
  CoreGraphUpdateParticipant,
} from "../../lib/core-graph/CoreGraphInteractors";
dotenv.config();

export class AiManager {
  constructor(
    private readonly toolbox: ToolboxRegistry,
    private readonly graphManager: CoreGraphManager,
    private readonly mainWindow?: MainWindow
  ) {}

  async sendPrompt(prompt: string, graphId: string, messages?: Message[]) {
    const exporter = new CoreGraphExporter(new BlypescriptExportStrategy(this.toolbox));
    const blypescriptProgram = exporter.exportGraph(this.graphManager.getGraph(graphId));
    const chat = new OpenAiChat(process.env.OPENAI_API_KEY || "", {
      model: "gpt-3.5-turbo-0613",
    });

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

    // loop starts here
    const iterationLimit = 5;
    for (let i = 0; i < iterationLimit; i++) {
      const response = await chat.runPrompt(prompt, messages);

      if (!response) return;

      const result = BlypescriptProgram.fromString(response.lastResponse);

      if (!result.success) {
        logger.warn(result.error);
        // chat.addMessage(result.message)
        continue; // retry if failure
      }

      const newBlypescriptProgram = result.data;

      let interpreter: BlypescriptInterpreter;

      try {
        // cant return Result interface in constructor, this function will only break if we are bozo anyway
        interpreter = new BlypescriptInterpreter(this.toolbox, this.graphManager);
        const result = interpreter.run(graphId, blypescriptProgram, newBlypescriptProgram, true);

        if (!result.success) {
          logger.warn(result.error);
          // chat.addMessage(result.message);
          continue; // retry if failure
        }

        this.graphManager.onGraphUpdated(
          graphId,
          new Set([CoreGraphUpdateEvent.graphUpdated, CoreGraphUpdateEvent.uiInputsUpdated]),
          CoreGraphUpdateParticipant.ai
        );
        return response;
      } catch (error) {
        // constructor failed
        logger.warn(error);
        return;
      }
    } // loop ends

    return;
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
abstract class Chat {
  protected readonly apiKey: string;
  protected messages: Message[] = [];
  protected iterationLimit = 10;

  constructor(apiKey = "") {
    this.apiKey = apiKey;
  }

  public appendMessage(message: Message) {
    this.messages.push(message);
  }

  public appendMessages(messages: Message[]) {
    this.messages.push(...messages);
  }
}

export type Message = {
  role: "system" | "user" | "assistant" | "blix";
  content: string;
};

type OpenAIChatConfig = {
  model?:
    | "gpt-4"
    | "gpt-4-0613"
    | "gpt-4-32k"
    | "gpt-4-32k-0613"
    | "gpt-3.5-turbo"
    | "gpt-3.5-turbo-0613"
    | "gpt-3.5-turbo-16k"
    | "gpt-3.5-turbo-16k-0613";
  temperature?: number;
};

class OpenAiChat extends Chat {
  private config: Configuration;
  private openai: OpenAIApi;
  private chatConfig!: Required<OpenAIChatConfig>;

  constructor(apiKey: string, chatConfig?: OpenAIChatConfig) {
    super(apiKey);

    this.config = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(this.config);

    this.setChatConfig(chatConfig);
  }

  public async runPrompt(prompt: string, messages?: Message[]) {
    this.messages = [...(messages ? messages : []), { role: "user", content: prompt }];
    const response = await this.runChatCompletion();

    if (!response) return "";

    const lastResponse = response.choices[response.choices.length - 1].message?.content || "";
    this.messages.push({ role: "assistant", content: lastResponse });

    return {
      lastResponse,
      messages: this.messages,
      usage: response.usage,
    };
  }

  public setChatConfig(chatConfig?: OpenAIChatConfig) {
    const chatConfigDefaults = {
      model: "gpt-3.5-turbo-0613",
      temperature: 0,
    } satisfies OpenAIChatConfig;

    this.chatConfig = {
      model: chatConfig?.model || chatConfigDefaults.model,
      temperature: chatConfig?.temperature || chatConfigDefaults.temperature,
    };
  }

  private async runChatCompletion() {
    const messages = this.messages.map((msg) => ({
      ...msg,
      role: msg.role === "blix" ? "user" : msg.role,
    }));
    const { model, temperature } = this.chatConfig;
    // TODO: Add some safety checks for request and response
    try {
      const response = await this.openai.createChatCompletion({
        model,
        temperature,
        messages,
      });
      return response.data;
    } catch (error) {
      // @ts-ignore
      if (error.response) {
        // @ts-ignore
        logger.error(error.response.status);
        // @ts-ignore
        logger.error(error.response.data);
      } else {
        // @ts-ignore
        logger.error(error.message);
      }
      return null;
    }
  }
}

// type Prettify<T> = {
//   [K in keyof T]: T[K];
// } & {};

// type test = Prettify<ChatCompletionRequestMessage>;
