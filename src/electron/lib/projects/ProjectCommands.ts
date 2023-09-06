import { showSaveDialog, showOpenDialog } from "../../utils/dialog";
import { app } from "electron";
import { join } from "path";
import {
  CoreGraphExporter,
  GraphFileExportStrategy,
  type GraphToJSON,
} from "../core-graph/CoreGraphExporter";
import logger from "../../utils/logger";
import { readFile, writeFile, open } from "fs/promises";
import type { ProjectFile } from "./CoreProject";
import type { Command, CommandContext } from "../../lib/registries/CommandRegistry";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { LayoutPanel, CommandResponse } from "../../../shared/types/index";
import { CoreGraphImporter } from "../../lib/core-graph/CoreGraphImporter";
import {
  CoreGraphUpdateEvent,
  CoreGraphUpdateParticipant,
} from "../core-graph/CoreGraphInteractors";
import sharp from "sharp";
import type { SvelvetCanvasPos } from "../../../shared/ui/UIGraph";
import settings from "../../utils/settings";
import type { recentProject } from "../../../shared/types/index";
import { getRecentProjects } from "../../utils/settings";

export type SaveProjectArgs = {
  projectId: UUID;
  layout?: LayoutPanel;
  projectPath?: string;
};

type ExportMedia = {
  type: string;
  data?: string;
};

export const getRecentProjectsCommand: Command = {
  id: "blix.projects.recent",
  description: {
    name: "Open recent project",
    description: "Open a recently edited project",
  },
  handler: async (ctx: CommandContext) => {
    try {
      return { status: "success", data: getRecentProjects() };
    } catch (e) {
      return { status: "error", message: "An exception occured", data: [] };
    }
  },
};

export const saveProjectCommand: Command = {
  id: "blix.projects.save",
  description: {
    name: "Save Project",
    description: "Save project to file system",
  },
  handler: async (ctx: CommandContext, args: SaveProjectArgs) => {
    const result: CommandResponse = await saveProject(ctx, args);
    if (result.status === "success" && result.message) {
      ctx.sendSuccessMessage(result.message);
    } else if (result.status === "error" && result.message) {
      ctx.sendErrorMessage(result.message);
    }
    return result;
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
    if (result.status === "success" && result.message) {
      ctx.sendSuccessMessage(result.message);
    } else if (result.status === "error" && result.message) {
      ctx.sendErrorMessage(result.message);
    }
    return result;
  },
};

export const openProjectCommand: Command = {
  id: "blix.projects.open",
  description: {
    name: "Open project...",
    description: "Save project to file system",
  },
  handler: async (ctx: CommandContext, params?: recentProject) => {
    return await (params ? openProject(ctx, params.path) : openProject(ctx));
  },
};

export const exportMediaCommand: Command = {
  id: "blix.exportMedia",
  description: {
    name: "Export Media As...",
    description: "Save media to file system",
  },
  handler: async (ctx: CommandContext, args: ExportMedia) => {
    const result = await exportMedia(ctx, args);
    if (result.status === "success" && result.message) {
      ctx.sendSuccessMessage(result?.message);
    } else if (result.status === "error" && result.message) {
      ctx.sendErrorMessage(result.message);
    }
    return result;
  },
};

export const projectCommands: Command[] = [
  saveProjectCommand,
  saveProjectAsCommand,
  openProjectCommand,
  exportMediaCommand,
  getRecentProjectsCommand,
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
  const { projectId, projectPath } = args;
  const project = ctx.projectManager.getProject(projectId);

  if (!project) {
    return { status: "error", message: "Project not found" };
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
  } else if (!project.location) {
    return { status: "error", message: "No path specified" };
  }

  // I don't really like this, but also can't really think of a nice way to change it
  // TODO: Rename sets name as path
  project.rename(project.location.toString().split("/").pop()!.split(".blix")[0]);
  ctx.projectManager.setProjectSaveState(project.uuid, true);
  // ctx.projectManager.onProjectChanged(project.uuid);

  const graphs = project.graphs.map((g) => ctx.graphManager.getGraph(g));
  const exporter = new CoreGraphExporter<GraphToJSON>(new GraphFileExportStrategy());
  const exportedGraphs = graphs.map((g) => exporter.exportGraph(g));

  const projectFile: ProjectFile = {
    layout: project.layout,
    graphs: exportedGraphs,
  };

  if (project.location) {
    try {
      await writeFile(project.location, JSON.stringify(projectFile));
    } catch (err) {
      logger.error(err);
    }
  }
  updateRecentProjectsList(project.location.toString());
  return { status: "success", message: "Project saved successfully" };
}

/**
 * This function saves a project to a specified path. If the project already has
 * a path, the project will be overwritten.
 *
 * @param id Project to be saved
 */
// TODO: Fix so that it works like the save with the command params system

export async function saveProjectAs(
  ctx: CommandContext,
  args: SaveProjectArgs
): Promise<CommandResponse> {
  const { projectId } = args;
  const project = ctx.projectManager.getProject(projectId);

  if (!project) {
    return { status: "error", message: "Project not found" };
  }
  const path = await showSaveDialog({
    title: "Save Project as",
    defaultPath: join(app.getPath("downloads"), project.name),
    filters: [{ name: "Blix Project", extensions: ["blix"] }],
    properties: ["createDirectory"],
  });
  if (!path) return { status: "error", message: "No path selected" };
  project.location = path;
  return saveProject(ctx, { projectId, projectPath: path });
}

/**
 * This function provides a dialog box for a user to select one or multiple
 * blix project files to open in their current editor window. It also then
 * loads the graphs for the projects.
 *
 * @returns Nothing
 */
export async function openProject(ctx: CommandContext, path?: string): Promise<CommandResponse> {
  let paths: string[] = [];

  if (!path) {
    const result = await showOpenDialog({
      title: "Import Project",
      defaultPath: app.getPath("downloads"),
      filters: [{ name: "Blix Project", extensions: ["blix"] }],
      properties: ["openFile", "multiSelections"],
    });
    if (!result) return { status: "error", message: "No project chosen" };
    paths = result;
  } else {
    paths = [path];
  }

  for (const path of paths) {
    const project = await readFile(path, "utf-8");
    const projectFile = JSON.parse(project) as ProjectFile;
    const projectName = path.split("/").pop()?.split(".blix")[0];
    const projectId = ctx.projectManager.loadProject(projectName!, path);
    ctx.projectManager.saveProjectLayout(projectId, projectFile.layout);
    // ctx.projectManager.getProject(projectId)!.saved = true;
    const coreGraphImporter = new CoreGraphImporter(ctx.toolbox);

    for (const graph of projectFile.graphs) {
      const coreGraph = coreGraphImporter.import("json", graph);
      ctx.graphManager.addGraph(coreGraph);
      ctx.projectManager.addGraph(projectId, coreGraph.uuid);
      ctx.graphManager.onGraphUpdated(
        coreGraph.uuid,
        new Set([CoreGraphUpdateEvent.graphUpdated, CoreGraphUpdateEvent.uiInputsUpdated]),
        CoreGraphUpdateParticipant.system
      );
    }
    ctx.mainWindow?.apis.projectClientApi.onProjectChanged({
      id: projectId,
      saved: true,
      layout: projectFile.layout,
    });
    updateRecentProjectsList(path);
  }

  return { status: "success", message: "Project(s) opened successfully" };
}

export async function exportMedia(
  ctx: CommandContext,
  args: ExportMedia
): Promise<CommandResponse> {
  if (!args) {
    return { status: "error", message: "No media selected to export" };
  }

  const { type, data } = args;

  if (!data) {
    return { status: "error", message: "No data was provided" };
  }

  if (type === "image") {
    const base64Data = data.split(";base64, ");
    const imgBuffer = Buffer.from(base64Data[1], "base64");

    const path = await showSaveDialog({
      title: "Export media as",
      defaultPath: "blix.png",
      // filters: [{ name: "Images", extensions: ["png, jpg", "jpeg"] }],
      properties: ["createDirectory"],
    });

    if (!path) return { status: "error", message: "No path chosen" };

    sharp(imgBuffer).toFile(path);

    return { status: "success", message: "Media exported successfully" };
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

    if (!path) return { status: "error", message: "Not path chosen" };

    try {
      writeFile(path, JSON.stringify(fileData));
    } catch (err) {
      logger.error(err);
    }

    return { status: "success", message: "Media exported successfully" };
  } else {
    return { status: "success", message: "Unsupported media type" };
  }
}

// TODO: Implement some sort of limit to how long the history of recent projects is.
export async function updateRecentProjectsList(projectPath: string) {
  const currentProjects: recentProject[] = settings.get("recentProjects");
  let validProjects: recentProject[] = [];

  const results = await Promise.all(
    currentProjects.map(async (project) => await validateProjectPath(project.path))
  );
  for (let i = 0; i < currentProjects.length; i++) {
    validProjects = results[i] ? [...validProjects, currentProjects[i]] : validProjects;
  }

  validProjects = validProjects.filter((project) => project.path !== projectPath);
  const str = new Date().toUTCString().split(",")[1];
  const date = str.slice(1, str.lastIndexOf(" "));
  validProjects.unshift({ path: projectPath, lastEdited: date });
  settings.set("recentProjects", validProjects);
  logger.info(settings.get("recentProjects"));
}

/**
 * This function will check if the path specified has the ability to be read
 *
 * @param path Path to be checked
 * @returns A boolean response
 */
export async function validateProjectPath(path: string): Promise<boolean> {
  try {
    await (await open(path, "r")).close();
    return true;
  } catch (e) {
    return false;
  }
}
