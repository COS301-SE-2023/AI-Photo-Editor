import { z } from "zod";
import type { CoreGraphManager } from "../../lib/core-graph/CoreGraphManager";
import { LLMExportStrategy, type LLMGraph } from "../../lib/core-graph/CoreGraphExporter";
import { NodeInstance } from "../../lib/registries/ToolboxRegistry";
import { type NodeSignature } from "../../../shared/ui/ToolboxTypes";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { QueryResponse } from "../../../shared/types";
import { CoreGraphUpdateParticipant } from "../../lib/core-graph/CoreGraphInteractors";

// ==================================================================
//  Zod Types
// ==================================================================

const _exporter = new LLMExportStrategy();

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

export const updateInputValuesSchema = z.object({
  type: z.literal("function"),
  name: z.literal("updateInputValues"),
  args: z.object({
    nodeId: z.string(),
    changedInputValues: z.record(z.string(), z.union([z.string(), z.number()])),
  }),
});

export type UpdateInputValuesConfig = z.infer<typeof updateInputValuesSchema>;

export const updateInputValueSchema = z.object({
  type: z.literal("function"),
  name: z.literal("updateInputValue"),
  args: z.object({
    nodeId: z.string(),
    inputValueId: z.string(),
    newInputValue: z.union([z.string(), z.number()]),
  }),
});

export type UpdateInputValueConfig = z.infer<typeof updateInputValueSchema>;

export const exitResponseSchema = z.object({
  type: z.literal("exit"),
  message: z.string(),
  logs: z.optional(z.array(z.string())),
});

export type ExitResponse = z.infer<typeof exitResponseSchema>;

export const errorResponseSchema = z.object({
  type: z.literal("error"),
  error: z.string(),
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
  updateInputValuesSchema,
  updateInputValueSchema,
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

/**
 * Cooks a response object to be sent to the ai
 * @param data Data to be sent to the ai
 * @returns Cooked response object
 * */

export function cookUnsafeResponse(data: any) {
  return responseSchema.parse(data);
}

// All the LLM methods should return some JS object which can be stringified

/**
 * Calls addNode from coreGraphManager to add a node to the graph
 * @param graphManager CoreGraphManager instance
 * @param toolboxRegistry ToolboxRegistry instance
 * @param graphId Id of the graph to which the node is to be added
 * @param args zod object that contains the arguments for the addNode function :
 * {
 * signature : string
 * }
 * @returns Returns response from the graphManager
 * */

export function addNode(
  graphManager: CoreGraphManager,
  registry: { [key: NodeSignature]: NodeInstance },
  graphId: UUID,
  args: AddNodeConfig["args"]
) {
  try {
    const node = registry[args.signature];
    if (!node) return errorResponse("The provided signature is invalid :  node does not exist");

    const response = graphManager.addNode(graphId, node, CoreGraphUpdateParticipant.ai);

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

/**
 * Calls removeNode from coreGraphManager to remove a node from the graph, id of node is provided.
 * @param graphManager CoreGraphManager instance
 * @param graphId Id of the graph from which the node is to be removed
 * @param args zod object that contains the arguments for the removeNode function :
 * {
 * id : string
 * }
 * @returns Returns response from the graphManager
 * */

export function removeNode(
  graphManager: CoreGraphManager,
  graphId: UUID,
  args: RemoveNodeConfig["args"]
) {
  try {
    const graph = _exporter.export(graphManager.getGraph(graphId));
    const { nodeMap } = graph;

    const fullId = nodeMap[args.id];
    if (fullId === undefined)
      return errorResponse("The provided id is invalid :  id does not exist");

    const response = graphManager.removeNode(graphId, fullId, CoreGraphUpdateParticipant.ai);
    return response;
  } catch (error) {
    return errorResponse(error as string);
  }
}

/**
 *
 * Calls addEdge from coreGraphManager to add an edge to the graph
 * @param graphManager CoreGraphManager instance
 * @param graphId Id of the graph to which the edge is to be added
 * @param args zod object that contains the arguments for the addEdge function :
 * {
 * output : string
 * input : string
 * }
 *
 * @returns Returns response from the graphManager
 * */

export function addEdge(
  graphManager: CoreGraphManager,
  graphId: UUID,
  args: AddEdgeConfig["args"]
) {
  try {
    const graph = _exporter.export(graphManager.getGraph(graphId));
    const { anchorMap } = graph;
    const output = anchorMap[args.output];
    const input = anchorMap[args.input];
    if (output === undefined)
      return errorResponse("Output anchor" + args.output + "does not exist");
    if (input === undefined) return errorResponse("Input anchor" + args.input + "does not exist");

    const response = graphManager.addEdge(graphId, input, output, CoreGraphUpdateParticipant.ai);
    return response;
  } catch (error) {
    // Manual error to give ai
    return errorResponse(error as string);
  }
}

/**
 *
 * Calls removeEdge from coreGraphManager to remove an edge from the graph, id of edge is provided.
 * @param graphManager CoreGraphManager instance
 * @param graphId Id of the graph from which the edge is to be removed
 * @param args zod object that contains the arguments for the removeEdge function :
 * {
 * id : string
 * }
 *
 * @returns Returns response from the graphManager
 * */

export function removeEdge(
  graphManager: CoreGraphManager,
  graphId: UUID,
  args: RemoveEdgeConfig["args"]
) {
  try {
    const graph = getGraph(graphManager, graphId);

    const edge = findEdgeById(graph.graph.edges, args.id);

    if (edge === undefined) return errorResponse("The provided id is invalid :  id does not exist");

    const { anchorMap } = graph;
    const anchor = anchorMap[edge?.input];

    if (anchor === undefined)
      return errorResponse("The provided id is invalid :  id does not exist");

    const response = graphManager.removeEdge(graphId, anchor, CoreGraphUpdateParticipant.ai);
    return response;
  } catch (error) {
    // Manual error to give ai
    return errorResponse(error as string);
  }
}

export function updateInputValues(
  graphManager: CoreGraphManager,
  graphId: string,
  args: UpdateInputValuesConfig["args"]
) {
  // const graph = _exporter.export(graphManager.getGraph(graphId));
  // const { nodeMap } = graph;
  // return graphManager.updateUIInputsTest(graphId, nodeMap[args.nodeId], args.changedInputValues);
  return { status: "error", message: "Not implemented" } satisfies QueryResponse;
}

export function updateInputValue(
  graphManager: CoreGraphManager,
  graphId: string,
  args: UpdateInputValueConfig["args"]
) {
  const graph = graphManager.getGraph(graphId);

  if (!graph) {
    return {
      status: "error",
      message: "Graph does not exist",
    };
  }

  const llmGraph = _exporter.export(graph);
  const { nodeMap } = llmGraph;
  const { inputValueId, newInputValue, nodeId } = args;
  const changedUIInputs = { [inputValueId]: newInputValue };
  const updatedInputValues = graph.getUpdatedUIInputs(nodeMap[nodeId], changedUIInputs);

  if (updatedInputValues.status === "error") {
    return updatedInputValues;
  }

  return graphManager.updateUIInputs(
    graphId,
    nodeMap[nodeId],
    updatedInputValues.data,
    CoreGraphUpdateParticipant.ai
  );
}

// ==================================================================
//  Helper Functions
// ==================================================================

// Do we want to make this a zod object?
interface Edge {
  id: string;
  input: string;
  output: string;
}

/**
 * Finds an edge object based on its id
 * @param edges Interface that holds edge id, input anchor id and output anchor id
 * @param id Id of the edge to be found
 * @returns The edge that was found, or returns undefined
 * */

export function findEdgeById(edges: Edge[], id: string): Edge | undefined {
  return edges.find((edge) => edge.id === id);
}

/**
 * Returns an error response object
 * @param message Error message to be sent
 * @returns Error response object
 * */

export function errorResponse(message: string) {
  const response: QueryResponse = {
    status: "error",
    message,
  };
  return response;
}

/**
 * Returns a debug response object
 * @param message Debug message to be sent
 * @returns Debug response object
 * */

export function getGraph(graphManager: CoreGraphManager, id: UUID): LLMGraph {
  return _exporter.export(graphManager.getGraph(id));
}

/**
 * Returns a debug response object
 * @param message Debug message to be sent
 * @returns Debug response object
 * */

export function truncId(arr: string[]): string[] {
  return arr.map((str) => str.slice(0, 6));
}

export function splitStringIntoJSONObjects(input: string) {
  if (input.trim() === "") {
    return [];
  }

  const jsonObjects = [];
  let currentIndex = 0;
  let openBrackets = 0;

  for (let i = 0; i < input.length; i++) {
    if (input[i] === "{") {
      openBrackets++;
    } else if (input[i] === "}") {
      openBrackets--;
    }

    if (openBrackets === 0 && input[i] === "}") {
      const substring = input.substring(currentIndex, i + 1);
      jsonObjects.push(substring);
      currentIndex = i + 1;
    }
  }

  return jsonObjects;
}
