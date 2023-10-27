/* eslint-disable @typescript-eslint/naming-convention */
import { Chat } from "./Chat";
import { type Result } from "./AiLang";
import { genericErrorResponse } from "./AiManagerv2";
import OpenAI from "openai";
import logger from "../../utils/logger";
import { DiscussServiceClient } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";
import { getExamples } from "./prompt";

/**
 * Wrapper interface for various LLM model implementations
 */
export abstract class Model {
  protected apiKey: string;
  protected temperature: number;

  constructor(config: Required<ModelConfig>) {
    this.apiKey = config.apiKey;
    this.temperature = config.temperature;
  }

  public static create(config: Required<ModelConfig>): Model {
    if (config.model.startsWith("GPT")) {
      return new OpenAiModel(config as Required<ModelConfig<OpenAiChatModel>>);
    } else {
      return new PalmModel(config as Required<ModelConfig<PalmChatModel>>);
    }
  }

  public abstract generate(chat: Chat): Promise<Result<ModelResponse>>;

  public abstract getType(): ChatModel;
}

export class OpenAiModel extends Model {
  private model: OpenAiChatModel;
  private openai: OpenAI;

  constructor(config: Required<ModelConfig<OpenAiChatModel>>) {
    super(config);
    this.model = config.model;
    this.openai = new OpenAI({ apiKey: this.apiKey, timeout: 60 * 1000 });
  }

  public async generate(chat: Chat): Promise<Result<ModelResponse>> {
    const formattedMessages = chat.getMessages().map((msg) => ({
      ...msg,
      role: msg.role === "blix" ? "user" : msg.role,
    }));

    try {
      const start = performance.now();
      const response = await this.openai.chat.completions.create({
        model: OPENAI_CHAT_MODELS[this.model],
        temperature: this.temperature,
        messages: formattedMessages,
      });
      const end = performance.now();

      const lastResponse = response.choices[response.choices.length - 1].message?.content || "";

      return {
        success: true,
        data: {
          content: lastResponse,
          time: end - start,
          usage: {
            completionTokens: response.usage?.completion_tokens || 0,
            promptTokens: response.usage?.prompt_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
        },
      };
    } catch (error) {
      const response: Result = {
        success: false,
        error: "openai_completions_error",
        message: genericErrorResponse,
      };

      if (error instanceof OpenAI.APIError) {
        if (error.code === "invalid_api_key") {
          response.error = "invalid_api_key";
          response.message = "Open AI API key is invalid.";
        } else if (error.message.toLocaleLowerCase().includes("connection")) {
          response.error = "connection_error";
          response.message = "The internet connection appears to be offline.";
        } else if (error.message.toLocaleLowerCase().includes("provide your api")) {
          response.error = "invalid_api_key";
          response.message = "Open AI API key hasn't been provided.";
        } else if (error.code === "context_length_exceeded") {
          response.error = "context_length_exceeded";
          response.message = "The context length has been exceeded.";
        }

        logger.error(error.code);
      }

      return response;
    }
  }

  public getType(): ChatModel {
    return this.model;
  }
}

export class PalmModel extends Model {
  private model: PalmChatModel;
  private palm: DiscussServiceClient;

  constructor(config: Required<ModelConfig<PalmChatModel>>) {
    super(config);
    this.model = config.model;
    this.palm = new DiscussServiceClient({
      // Issue with Google Auth type mismatches
      authClient: new GoogleAuth().fromAPIKey(this.apiKey) as any,
    });
  }

  public async generate(chat: Chat): Promise<Result<ModelResponse>> {
    try {
      const chatMessages = chat.getMessages();
      const context = chatMessages
        .slice(0, -1)
        .map((m) => m.content)
        .join("\n\n");
      const lastMessage = chatMessages.at(-1)?.content || "";

      const start = performance.now();
      const result = await this.palm.generateMessage({
        model: `models/${PALM_CHAT_MODELS[this.model]}`,
        temperature: this.temperature,
        candidateCount: 1,
        prompt: {
          context,
          messages: [{ content: lastMessage }],
          examples: getExamples().map((e) => ({
            input: { content: e.user },
            output: { content: e.assistant },
          })),
        },
      });
      const end = performance.now();

      if (!result[0] || !result[0].candidates) {
        return {
          success: false,
          error: "palm_api_error",
          message: "Error with palm generative result",
        };
      }

      return {
        success: true,
        data: {
          content: result[0].candidates[0].content || "",
          time: end - start,
          usage: {
            completionTokens: 0,
            promptTokens: 0,
            totalTokens: 0,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "unknown_palm_api_error",
        message: "An unknown error has occurred with the PaLM API",
      };
    }
  }

  public getType(): ChatModel {
    return this.model;
  }
}

// ==================================================================
// Model Types
// ==================================================================

export const OPENAI_CHAT_MODELS = {
  "GPT-4": "gpt-4-0613",
  "GPT-4-32K": "gpt-4-32k-0613",
  "GPT-3.5": "gpt-3.5-turbo-0613",
  "GPT-3.5-16K": "gpt-3.5-turbo-16k-0613",
} as const;

export const PALM_CHAT_MODELS = {
  "PaLM-Chat": "chat-bison-001",
} as const;

export const CHAT_MODELS = {
  ...OPENAI_CHAT_MODELS,
  ...PALM_CHAT_MODELS,
} as const;

export type OpenAiChatModel = keyof typeof OPENAI_CHAT_MODELS;
export type PalmChatModel = keyof typeof PALM_CHAT_MODELS;
export type ChatModel = keyof typeof CHAT_MODELS;

export type ModelConfig<TModel = ChatModel> = {
  model?: TModel;
  apiKey?: string;
  temperature?: number;
};

export type ModelUsage = {
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
};

export type ModelResponse = {
  content: string;
  time: number;
  usage?: ModelUsage;
};
