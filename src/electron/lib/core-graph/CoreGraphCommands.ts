import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { Command, CommandContext } from "../../lib/registries/CommandRegistry";
import type { CommandResponse } from "../projects/ProjectCommands";
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
    switch (result.success) {
      case true: {
        ctx.sendSuccessMessage(result?.message ?? "");
        break;
      }
      case false: {
        ctx.sendErrorMessage(result?.error ?? "");
        break;
      }
    }
    // if (result.success) {
    //   ctx.sendSuccessMessage(result?.message ?? "");
    // } else {
    //   ctx.sendErrorMessage(result?.error ?? "");
    // }
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
  },
};

export async function createGraph(
  ctx: CommandContext,
  args: CreateGraphArgs
): Promise<CommandResponse> {
  const { projectId, name } = args;
  const project = ctx.projectManager.getProject(projectId);
  if (!project) return { success: false, error: "Project not found" };

  const graphId = ctx.graphManager.createGraph();
  ctx.graphManager.onGraphUpdated(
    graphId,
    new Set([CoreGraphUpdateEvent.graphUpdated]),
    CoreGraphUpdateParticipant.system
  );
  ctx.projectManager.addGraph(projectId, graphId);

  return { success: true, message: "Graph created successfully" };
}

export const coreGraphCommands: Command[] = [createGraphCommand, deleteGraphCommand];
