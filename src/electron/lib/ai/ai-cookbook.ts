import { z } from "zod";
import type { CoreGraphManager } from "../../lib/core-graph/CoreGraphManager";
import {
  CoreGraphExporter,
  LLMExportStrategy,
  type LLMGraph,
} from "../../lib/core-graph/CoreGraphExporter";
import { ToolboxRegistry } from "../../lib/registries/ToolboxRegistry";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { QueryResponse } from "../../../shared/types";

// ==================================================================
//  Zod Types
// ==================================================================

export const addNodeSchema = z.object({
  type: z.literal("function"),
  name: z.literal("addNode"),
  args: z.object({
    signature: z.string(),
  }),
});

export type AddNodeConfig = z.infer<typeof addNodeSchema>;

export const removeNodeSchema = z.object({
  type: z.literal("function"),
  name: z.literal("removeNode"),
  args: z.object({
    id: z.string(),
  }),
});

export type RemoveNodeConfig = z.infer<typeof removeNodeSchema>;

export const addEdgeSchema = z.object({
  type: z.literal("function"),
  name: z.literal("addEdge"),
  args: z.object({
    output: z.string(),
    input: z.string(),
  }),
});

export type AddEdgeConfig = z.infer<typeof addEdgeSchema>;

export const removeEdgeSchema = z.object({
  type: z.literal("function"),
  name: z.literal("removeEdge"),
  args: z.object({
    id: z.string(),
  }),
});

export type RemoveEdgeConfig = z.infer<typeof removeEdgeSchema>;

export const exitResponseSchema = z.object({
  type: z.literal("exit"),
  message: z.string(),
  logs: z.optional(z.array(z.string())),
});

export type ExitResponse = z.infer<typeof exitResponseSchema>;

export const errorResponseSchema = z.object({
  type: z.literal("error"),
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const debugResponseSchema = z.object({
  type: z.literal("debug"),
  message: z.string(),
});

export type DebugResponse = z.infer<typeof debugResponseSchema>;

export const responseSchema = z.union([
  addNodeSchema,
  removeNodeSchema,
  addEdgeSchema,
  removeEdgeSchema,
  addEdgeSchema,
  exitResponseSchema,
  errorResponseSchema,
  debugResponseSchema,
]);

export type Response = z.infer<typeof responseSchema>;
export type ResponseFunctions = ExtractResponseFunctions<Response>;

type ExtractResponseFunctions<T> = T extends { type: "function" } ? T : never;

// ==================================================================
//  Cookbook Functions
// ==================================================================

export function cookUnsafeResponse(data: any) {
  return responseSchema.parse(data);
}

// All the LLM methods should return some JS object which can be stringified

export function addNode(
  graphManager: CoreGraphManager,
  toolboxRegistry: ToolboxRegistry,
  graphId: UUID,
  args: AddNodeConfig["args"]
) {
  try {
    const node = toolboxRegistry.getNodeInstance(args.signature);
    if (!node) return errorResponse("The provided signature is invalid :  node does not exist");

    const response = graphManager.addNode(graphId, node);

    if (response.status === "success" && response.data) {
      // Truncate ids
      response.data.inputs = truncId(response.data.inputs);
      response.data.outputs = truncId(response.data.outputs);
      response.data.nodeId = truncId([response.data.nodeId])[0];
    }

    return response;
  } catch (error) {
    return errorResponse(error as string);
  }
}

// ==================================================================
//  Helper Functions
// ==================================================================

export function errorResponse(message: string) {
  const response: QueryResponse = {
    status: "error",
    message,
  };
  return response;
}

export function truncId(arr: string[]): string[] {
  return arr.map((str) => str.slice(0, 6));
}
