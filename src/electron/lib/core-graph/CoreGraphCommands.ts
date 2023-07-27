import type { UUID } from "@shared/utils/UniqueEntity";
import type {
  Command,
  CommandContext,
  CommandDescription,
} from "../../lib/registries/CommandRegistry";
import type { CommandResponse } from "../projects/ProjectCommands";

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
    if (result.success) {
      ctx.sendSuccessMessage(result?.message ?? "");
    } else {
      ctx.sendErrorMessage(result?.error ?? "");
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
  const graph = ctx.graphManager.getGraph(ctx.graphManager.createGraph());
  if (!graph) return { success: false, error: "Graph not found" };

  project.addGraph(graph.uuid);
  ctx.graphManager.onGraphUpdated(graph.uuid);
  ctx.mainWindow?.apis.projectClientApi.onProjectChanged({
    id: projectId,
    graphs: [...project.graphs],
  });
  return { success: true, message: "Graph created successfully" };
}

export const coreGraphCommands: Command[] = [createGraphCommand];
