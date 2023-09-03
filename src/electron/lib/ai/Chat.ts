import crypto from "crypto";

export class Chat {
  public readonly id: string;

  protected messages: Message[] = [];

  constructor() {
    this.id = crypto.randomUUID();
  }

  public addMessage(message: Message) {
    this.messages.push(message);
  }

  public addMessages(messages: Message[]) {
    this.messages.push(...messages);
  }

  public getMessages() {
    return [...this.messages];
  }

}

// ==================================================================
// Message Types
// ==================================================================

export type Message = {
  role: "system" | "user" | "assistant" | "blix";
  content: string;
};


// import crypto from "crypto";
// import OpenAi from "openai";
// import { genericErrorResponse } from "./AiManagerv2";
// import { colorString, type Result } from "./AiLang";
// import logger from "../../utils/logger";
// import { DiscussServiceClient } from "@google-ai/generativelanguage";
// import { GoogleAuth } from "google-auth-library";
// import dotenv from "dotenv";
// dotenv.config();

// // ========== Types ========== //

// export type Message = {
//   role: "system" | "user" | "assistant" | "blix";
//   content: string;
// };

// export type ChatResponse =
//   | {
//       success: true;
//       lastResponse: string;
//     }
//   | {
//       success: false;
//       message: string;
//       code: "invalid_api_key" | "connection_error" | "unknown_error";
//     };

// export const CHAT_MODELS = {
//   "GPT-4": "gpt-4-0613",
//   "GPT-4-32K": "gpt-4-32k-0613",
//   "GPT-3.5": "gpt-3.5-turbo-0613",
//   "GPT-3.5-16K": "gpt-3.5-turbo-16k-0613",
//   "PaLM-Chat-Bison": "chat-bison-001",
// } as const;

// export type ChatModel = keyof typeof CHAT_MODELS;

// export abstract class Chat {
//   public readonly id: string;
//   protected messages: Message[] = [];
//   protected _iterationLimit = 10;
//   protected _iteration = 0;

//   constructor() {
//     this.id = crypto.randomUUID();
//   }

//   public abstract generate(prompt: string, apiKey: string): Promise<ChatResponse>;

//   public addMessage(message: Message) {
//     this.messages.push(message);
//   }

//   public addMessages(messages: Message[]) {
//     this.messages.push(...messages);
//   }

//   public getMessages() {
//     return [...this.messages];
//   }

//   public get iterationLimit() {
//     return this._iterationLimit;
//   }

//   public get iteration() {
//     return this._iteration;
//   }

// }

// // ==================================================================
// // OPEN AI
// // ==================================================================

// type OpenAiModel = 
//     | "gpt-4"
//     | "gpt-4-0613"
//     | "gpt-4-32k"
//     | "gpt-4-32k-0613"
//     | "gpt-3.5-turbo"
//     | "gpt-3.5-turbo-0613"
//     | "gpt-3.5-turbo-16k"
//     | "gpt-3.5-turbo-16k-0613";

// type OpenAiChatConfig = {
//   model?: OpenAiModel
//   temperature?: number;
// };

// export class OpenAiChat extends Chat {
//   private openai: OpenAi;
//   private chatConfig!: Required<OpenAiChatConfig>;

//   constructor(chatConfig?: OpenAiChatConfig) {
//     super();
//     this.openai = new OpenAi();
//     this.setChatConfig(chatConfig);
//   }

//   public async generate(prompt: string, apiKey: string): Promise<ChatResponse> {
//     this.openai.apiKey = apiKey;
//     this.messages.push({ role: "user", content: `USER'S INPUT: ${prompt}` });

//     const formattedMessages = this.messages.map((msg) => ({
//       ...msg,
//       role: msg.role === "blix" ? "user" : msg.role,
//     }));

//     try {
//       const response = await this.openai.chat.completions.create({
//         model: this.chatConfig.model,
//         temperature: this.chatConfig.temperature,
//         messages: formattedMessages,
//       });

//       const lastResponse = response.choices[response.choices.length - 1].message?.content || "";
//       this.messages.push({ role: "assistant", content: lastResponse });

//       return {
//         success: true,
//         lastResponse,
//       };
//     } catch (error) {
//       const response: ChatResponse = {
//         success: false,
//         code: "unknown_error",
//         message: genericErrorResponse,
//       };

//       if (error instanceof OpenAi.APIError) {
//         if (error.code === "invalid_api_key") {
//           response.code = "invalid_api_key";
//           response.message = "Open AI API key is invalid.";
//         } else if (error.message.toLocaleLowerCase().includes("connection")) {
//           response.code = "connection_error";
//           response.message = "The internet connection appears to be offline.";
//         } else if (error.message.toLocaleLowerCase().includes("provide your api")) {
//           response.code = "invalid_api_key";
//           response.message = "Open AI API key hasn't been provided.";
//         }

//         logger.error(error.code);
//       }


//       return response;
//     }
//   }

//   public setChatConfig(chatConfig?: OpenAiChatConfig) {
//     const chatConfigDefaults = {
//       model: "gpt-3.5-turbo-0613",
//       temperature: 0,
//     } satisfies OpenAiChatConfig;

//     this.chatConfig = {
//       model: chatConfig?.model || chatConfigDefaults.model,
//       temperature: chatConfig?.temperature || chatConfigDefaults.temperature,
//     };
//   }

// }

// // ==================================================================
// // PALM
// // ==================================================================

// type PalmModel = 
//     | "chat-bison-001";

// type PalmChatConfig = {
//   model?: PalmModel
//   temperature?: number;
// };

// export class PalmChat extends Chat {
//   private palm: DiscussServiceClient;
//   private chatConfig!: Required<PalmChatConfig>;

//   constructor(chatConfig?: PalmChatConfig) {
//     super();

//     // this.palm = new DiscussServiceClient({
//     //   authClient: new GoogleAuth().fromAPIKey(apiKey) as any,
//     // });

//     this.palm = new DiscussServiceClient();

//     this.setChatConfig(chatConfig);
//   }

//   public async generate(prompt: string, apiKey: string): Promise<ChatResponse> {
//     // TODO: Add properly to Blix
//     apiKey = process.env.PALM_API_KEY || "";
//     this.palm.auth = new GoogleAuth().fromAPIKey(apiKey) as any
//     this.messages.push({role: "system", content: "Only respond with the updated graph code."});

//     if (prompt) {
//       this.messages.push({ role: "user", content: prompt });
//     }

//     try {
//       console.log(prompt);
//       const result = await this.palm.generateMessage({
//         model: `models/${this.chatConfig.model}`,
//         temperature: this.chatConfig.temperature,
//         candidateCount: 1,
//         prompt: {
//           context: this.messages.slice(0, 5).map((m) => m.content).join("\n\n"),
//           messages: [{ content: this.messages.slice(-1)[0].content}]
//         }
//       })

//       if (!result[0] || !result[0].candidates) {
//         return {
//           success: false,
//           code: "unknown_error",
//           message: "Error with palm generative result"
//         };
//       }

//       return {
//         success: true,
//         lastResponse: result[0].candidates[0].content || ""
//       }
//     } catch(error) {
//       // @ts-ignore
//       console.log(error.message)
//       return {
//         success: false,
//         code: "unknown_error",
//         message: "Ah shit"
//       }
//     }


//   }

//   public setChatConfig(chatConfig?: PalmChatConfig) {
//     const chatConfigDefaults = {
//       model: "chat-bison-001",
//       temperature: 0,
//     } satisfies PalmChatConfig;

//     this.chatConfig = {
//       model: chatConfig?.model || chatConfigDefaults.model,
//       temperature: chatConfig?.temperature || chatConfigDefaults.temperature,
//     };
//   }

// }
