import crypto from "crypto";
import OpenAi from "openai";
import { genericErrorResponse } from "./AiManagerv2";
import type { Result } from "./AiLang";
import logger from "../../utils/logger";

// ========== Types ========== //

export type Message = {
  role: "system" | "user" | "assistant" | "blix";
  content: string;
};

export type ChatResponse =
  | {
      success: true;
      lastResponse: string;
    }
  | {
      success: false;
      message: string;
      code: "invalid_api_key" | "connection_error" | "unknown_error";
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

// ========== Classes ========== //

export abstract class Chat {
  public readonly id: string;
  protected readonly apiKey: string;
  protected messages: Message[] = [];
  protected _iterationLimit = 10;
  protected _iteration = 0;

  constructor(apiKey = "") {
    this.id = crypto.randomUUID();
    this.apiKey = apiKey;
  }

  public abstract run(prompt?: string): Promise<ChatResponse>;

  public addMessage(message: Message) {
    this.messages.push(message);
  }

  public addMessages(messages: Message[]) {
    this.messages.push(...messages);
  }

  public getMessages() {
    return [...this.messages];
  }

  public get iterationLimit() {
    return this._iterationLimit;
  }

  public get iteration() {
    return this._iteration;
  }
}

export class OpenAiChat extends Chat {
  private openai: OpenAi;
  private chatConfig!: Required<OpenAIChatConfig>;

  constructor(apiKey: string, chatConfig?: OpenAIChatConfig) {
    super(apiKey);

    this.openai = new OpenAi({
      apiKey,
    });

    this.setChatConfig(chatConfig);
  }

  public async run(prompt?: string): Promise<ChatResponse> {
    if (prompt) {
      this.messages.push({ role: "user", content: prompt });
    }

    const formattedMessages = this.messages.map((msg) => ({
      ...msg,
      role: msg.role === "blix" ? "user" : msg.role,
    }));

    try {
      const response = await this.openai.chat.completions.create({
        model: this.chatConfig.model,
        temperature: this.chatConfig.temperature,
        messages: formattedMessages,
      });

      const lastResponse = response.choices[response.choices.length - 1].message?.content || "";
      this.messages.push({ role: "assistant", content: lastResponse });

      return {
        success: true,
        lastResponse,
      };
    } catch (error) {
      const response: ChatResponse = {
        success: false,
        code: "unknown_error",
        message: genericErrorResponse,
      };

      if (error instanceof OpenAi.APIError) {
        if (error.code === "invalid_api_key") {
          response.code = "invalid_api_key";
          response.message = "Open AI API key is invalid.";
        } else if (error.message.toLocaleLowerCase().includes("connection")) {
          response.code = "connection_error";
          response.message = "The internet connection appears to be offline.";
        }

        logger.error(error.code);
      }

      return response;
    }
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
      const response = await this.openai.chat.completions.create({
        model,
        temperature,
        messages,
      });

      return {
        success: true,
        data: response,
      } satisfies Result;
    } catch (error) {
      const response: Result = {
        success: false,
        error: "unknown_error",
        message: genericErrorResponse,
      };

      if (error instanceof OpenAi.APIError) {
        if (error.code === "invalid_api_key") {
          response.error = "invalid_api_key";
          response.message = "OpenAI API key is invalid.";
        }
        if (error.message.toLocaleLowerCase().includes("connection")) {
          response.error = "connection_error";
          response.message = "The internet connection appears to be offline.";
        }
        logger.error(error.status);
        logger.error(error.message);
        logger.error(error.code);
        logger.error(error.type);
      } else {
        logger.error(error);
      }

      return response;
    }
  }
}
