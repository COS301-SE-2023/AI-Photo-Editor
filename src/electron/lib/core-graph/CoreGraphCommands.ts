import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { Command, CommandContext } from "../../lib/registries/CommandRegistry";
import type { CommandResponse } from "../../../shared/types/index";
import { CoreGraphUpdateEvent, CoreGraphUpdateParticipant } from "./CoreGraphInteractors";

type CreateGraphArgs = {
  projectId: UUID;
  name?: string;
};

export const createGraphCommand: Command = {
  id: "blix.graphs.create",
  description: {
    name: "Create Graph",
    description: "Create a new graph",
  },
  handler: async (ctx: CommandContext, args: CreateGraphArgs) => {
    const result = await createGraph(ctx, args);
    if (result.status === "success" && result.message) {
      ctx.sendSuccessMessage(result.message);
    } else if (result.status === "error" && result.message) {
      ctx.sendErrorMessage(result.message);
    }
    return result;
  },
};

export const deleteGraphCommand: Command = {
  id: "blix.graphs.deleteGraph",
  description: {
    name: "Delete graph",
    description: "Delete the current graph",
  },
  handler: async (ctx: CommandContext, args: { id: UUID }) => {
    if (args && typeof args === "object" && args.id) {
      ctx.projectManager.removeGraph(args.id);
      ctx.graphManager.deleteGraphs([args.id]);
    }
    return { status: "success", message: "Graph deleted successfully" };
  },
};

export async function createGraph(
  ctx: CommandContext,
  args: CreateGraphArgs
): Promise<CommandResponse> {
  const { projectId, name } = args;
  const project = ctx.projectManager.getProject(projectId);
  if (!project) return { status: "error", message: "Project not found" };

  const graphId = ctx.graphManager.createGraph();
  ctx.graphManager.onGraphUpdated(
    graphId,
    new Set([CoreGraphUpdateEvent.graphUpdated]),
    CoreGraphUpdateParticipant.system
  );
  ctx.projectManager.addGraph(projectId, graphId);

  return { status: "success", message: "Graph created successfully" };
}

export const coreGraphCommands: Command[] = [
  createGraphCommand,
  // deleteGraphCommand
];
