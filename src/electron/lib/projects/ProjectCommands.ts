import { showSaveDialog, showOpenDialog } from "../../utils/dialog";
import { app } from "electron";
import { join } from "path";
import {
  CoreGraphExporter,
  GraphFileExportStrategy,
  type GraphToJSON,
} from "../core-graph/CoreGraphExporter";
import logger from "../../utils/logger";
import { readFile, writeFile } from "fs/promises";
import type { ProjectFile } from "./CoreProject";
import type { Command, CommandContext } from "../../lib/registries/CommandRegistry";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { LayoutPanel } from "../../../shared/types";
import { CoreGraphImporter } from "../../lib/core-graph/CoreGraphImporter";
import {
  CoreGraphUpdateEvent,
  CoreGraphUpdateParticipant,
} from "../core-graph/CoreGraphInteractors";
import sharp from "sharp";

export type SaveProjectArgs = {
  projectId: UUID;
  layout?: LayoutPanel;
  projectPath?: string;
};

type ExportMedia = {
  type: string;
  data?: string;
};

export type CommandResponse =
  | {
      success: true;
      message?: string;
    }
  | {
      success: false;
      error?: string;
    };

export const saveProjectCommand: Command = {
  id: "blix.projects.save",
  description: {
    name: "Save Project",
    description: "Save project to file system",
  },
  handler: async (ctx: CommandContext, args: SaveProjectArgs) => {
    const result: CommandResponse = await saveProject(ctx, args);
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

// TODO: Fix so that it works like the save with the command params system
export const saveProjectAsCommand: Command = {
  id: "blix.projects.saveAs",
  description: {
    name: "Save Project As...",
    description: "Save project to file system",
  },
  handler: async (ctx: CommandContext, args: SaveProjectArgs) => {
    const result: CommandResponse = await saveProjectAs(ctx, args);
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
    //     // ctx.sendSuccessMessage(result?.message ?? "");
    // } else {
    //   ctx.sendErrorMessage(result?.error ?? "");
    // }
  },
};

export const openProjectCommand: Command = {
  id: "blix.projects.open",
  description: {
    name: "Open project...",
    description: "Save project to file system",
  },
  handler: openProject,
};

export const exportMediaCommand: Command = {
  id: "blix.exportMedia",
  description: {
    name: "Export Media As...",
    description: "Save media to file system",
  },
  handler: async (ctx: CommandContext, args: ExportMedia) => {
    const result = await exportMedia(ctx, args);
    if (result?.success && result.message) {
      ctx.sendSuccessMessage(result?.message);
    } else if (result?.error && result.error) {
      ctx.sendErrorMessage(result.error);
    }
  },
};

export const projectCommands: Command[] = [
  saveProjectCommand,
  saveProjectAsCommand,
  openProjectCommand,
  exportMediaCommand,
];

// =========== Command Helpers ===========

/**
 * This function saves a project to a specified path. If the project already has
 * a path, the project will be overwritten at that path. If the project does not
 * have a path, the user will be prompted to choose a path to save the project
 * to.
 *
 *
 * @param id Project to be exported
 * @param pathToProject Optional path used if project has specifically been
 * specified to be saved to a certain path
 */
export async function saveProject(
  ctx: CommandContext,
  args: SaveProjectArgs
): Promise<CommandResponse> {
  const { projectId, layout, projectPath } = args;
  const project = ctx.projectManager.getProject(projectId);

  if (!project) {
    return { success: false, error: "Project not found" };
  }

  let path: string | undefined = "";

  if (!project.location) {
    path = await showSaveDialog({
      title: "Save Project",
      defaultPath: join(app.getPath("downloads"), project.name),
      filters: [{ name: "Blix Project", extensions: ["blix"] }],
      properties: ["createDirectory"],
    });
  }

  if (path) {
    project.location = path;
  } else if (projectPath) {
    project.location = projectPath;
  }

  // I don't really like this, but also can't really think of a nice way to change it
  // TODO: Rename sets name as path
  project.rename((project.location as string).split("/").pop()!.split(".blix")[0]);
  ctx.projectManager.onProjectChanged(project.uuid);

  const graphs = project.graphs.map((g) => ctx.graphManager.getGraph(g));
  const exporter = new CoreGraphExporter<GraphToJSON>(new GraphFileExportStrategy());
  const exportedGraphs = graphs.map((g) => exporter.exportGraph(g));

  const projectFile: ProjectFile = {
    layout: layout!,
    graphs: exportedGraphs,
  };

  if (project.location) {
    try {
      await writeFile(project.location, JSON.stringify(projectFile));
    } catch (err) {
      logger.error(err);
    }
  }

  return { success: true, message: "Project saved successfully" };
}

/**
 * This function saves a project to a specified path. If the project already has
 * a path, the project will be overwritten.
 *
 * @param id Project to be saved
 */
// TODO: Fix so that it works like the save with the command params system

export async function saveProjectAs(ctx: CommandContext, args: SaveProjectArgs) {
  const { projectId, layout } = args;
  const project = ctx.projectManager.getProject(projectId);

  if (!project) {
    return { success: false, error: "Project not found" };
  }
  const path = await showSaveDialog({
    title: "Save Project as",
    defaultPath: join(app.getPath("downloads"), project.name),
    filters: [{ name: "Blix Project", extensions: ["blix"] }],
    properties: ["createDirectory"],
  });
  if (!path) return { success: false, error: "No path selected" };
  project.location = path;
  return await saveProject(ctx, { projectId, layout, projectPath: path });
}

/**
 * This function provides a dialog box for a user to select one or multiple
 * blix project files to open in their current editor window. It also then
 * loads the graphs for the projects.
 *
 * @returns Nothing
 */
export async function openProject(ctx: CommandContext) {
  const paths = await showOpenDialog({
    title: "Import Project",
    defaultPath: app.getPath("downloads"),
    filters: [{ name: "Blix Project", extensions: ["blix"] }],
    properties: ["openFile", "multiSelections"],
  });

  if (!paths) return;

  for (const path of paths) {
    const project = await readFile(path, "utf-8");
    const projectFile = JSON.parse(project) as ProjectFile;
    const projectName = path.split("/").pop()?.split(".blix")[0];
    const projectId = ctx.projectManager.loadProject(projectName!, path);

    const coreGraphImporter = new CoreGraphImporter(ctx.toolbox);

    for (const graph of projectFile.graphs) {
      const coreGraph = coreGraphImporter.import("json", graph);
      ctx.graphManager.addGraph(coreGraph);
      ctx.projectManager.addGraph(projectId, coreGraph.uuid);
      ctx.graphManager.onGraphUpdated(
        coreGraph.uuid,
        new Set([CoreGraphUpdateEvent.graphUpdated]),
        CoreGraphUpdateParticipant.system
      );
    }

    ctx.mainWindow?.apis.projectClientApi.onProjectChanged({
      id: projectId,
      layout: projectFile.layout,
    });
  }
}

export async function exportMedia(ctx: CommandContext, args: ExportMedia) {
  if (!args) {
    return { success: false, error: "No media selected to export" };
  }

  const { type, data } = args;

  if (!data) {
    return { success: false, error: "No data was provided" };
  }

  if (type === "Image") {
    const base64Data = data.split(";base64, ");
    const imgBuffer = Buffer.from(base64Data[1], "base64");

    const path = await showSaveDialog({
      title: "Export media as",
      defaultPath: "blix.png",
      // filters: [{ name: "Images", extensions: ["png, jpg", "jpeg"] }],
      properties: ["createDirectory"],
    });

    if (!path) return;

    sharp(imgBuffer).toFile(path);

    return { success: true, message: "Media exported successfully" };
  } else if (type === "Number" || type === "color" || type === "string") {
    const fileData = {
      OutputData: data,
    };
    const path = await showSaveDialog({
      title: "Export media as",
      defaultPath: "blix.json",
      filters: [{ name: "Data", extensions: ["json"] }],
      properties: ["createDirectory"],
    });

    if (!path) return;

    try {
      writeFile(path, JSON.stringify(fileData));
    } catch (err) {
      logger.error(err);
    }

    return { success: true, message: "Media exported successfully" };
  } else {
    return { success: false, error: "Unsupported media type" };
  }
}
