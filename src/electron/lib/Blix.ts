import { CommandRegistry } from "./registries/CommandRegistry";
import { ToolboxRegistry } from "./registries/ToolboxRegistry";
import { TileRegistry } from "./registries/TileRegistry";
import { ProjectManager } from "./projects/ProjectManager";
import type { MainWindow } from "./api/apis/WindowApi";
import { CoreGraphManager } from "./core-graph/CoreGraphManager";
import { PluginManager } from "./plugins/PluginManager";
import { IPCGraphSubscriber } from "./core-graph/CoreGraphInteractors";
import type { UUID } from "../../shared/utils/UniqueEntity";
import type { UIGraph } from "../../shared/ui/UIGraph";
import { testStuffies } from "./core-graph/CoreGraphTesting";
import logger from "../utils/logger";

import type { CoreProject, ProjectFile } from "./projects/CoreProject";
import {
  CoreGraphExporter,
  GraphFileExportStrategy,
  type GraphToJSON,
} from "./core-graph/CoreGraphExporter";
import { type PathLike, writeFile, writeFileSync } from "fs";
import { readFile } from "fs/promises";
import { app } from "electron";
import { join } from "path";
import { showOpenDialog, showSaveDialog } from "../utils/dialog";
import { type SharedProject } from "@shared/types";

// Encapsulates the backend representation for
// the entire running Blix application
export class Blix {
  private _toolbox: ToolboxRegistry;
  private _tileRegistry: TileRegistry;
  private _commandRegistry: CommandRegistry;
  private _graphManager!: CoreGraphManager;
  private _projectManager!: ProjectManager;
  private _pluginManager!: PluginManager;
  private _mainWindow!: MainWindow;

  // private startTime: Date;

  // TODO: We'll need a layout registry as well which can save its state to a file
  // private layoutRegistry: LayoutRegistry;
  // private currentLayout: LayoutId;

  constructor() {
    // this.startTime = new Date();
    this._toolbox = new ToolboxRegistry();
    this._commandRegistry = new CommandRegistry();
    this._tileRegistry = new TileRegistry();
  }

  /**
   * Initializes the managers of the electron app after the Main Window has been
   * instantiated. **Do not** change the implementation so that it passes in the
   * window through the constructor.
   *
   * @param mainWindow
   */
  public async init(mainWindow: MainWindow) {
    this._mainWindow = mainWindow;

    // Load plugins before instantiating any managers
    this._pluginManager = new PluginManager(this);
    await this._pluginManager.loadBasePlugins();

    this._graphManager = new CoreGraphManager(mainWindow, this._toolbox);
    this._projectManager = new ProjectManager(mainWindow);

    // Add subscribers
    const graphSubscriber = new IPCGraphSubscriber();

    graphSubscriber.listen = (graphId: UUID, newGraph: UIGraph) => {
      mainWindow.apis.graphClientApi.graphChanged(graphId, newGraph);
    };

    this._graphManager.addAllSubscriber(graphSubscriber);

    logger.info(await this._projectManager.getRecentProjectsList());

    // this.saveProject(testStuffies(this));
    // this.importProject();
  }

  // NOTICE: Potentially move these methods to commands later

  /**
   * This function saves a project to a specified path.
   * If the project already has a path, the project will be overwritten.
   *
   * @param id Project to be saved
   * @returns
   */
  public async saveProjectAs(id: UUID): Promise<void> {
    const project = this.projectManager.getProject(id);
    if (!project) return;
    const path = await showSaveDialog({
      title: "Save Project as",
      defaultPath: join(app.getPath("downloads"), project.name),
      filters: [{ name: "Blix Project", extensions: ["blix"] }],
    });
    if (!path) return;
    project.location = path;
    this.saveProject(id, path);
  }

  /**
   * This function saves a project to a specified path. If the project already has a path, the project will be overwritten
   * at that path. If the project does not have a path, the user will be prompted to choose a path to save the project to.
   *
   *
   * @param id Project to be exported
   * @param pathToProject Optional path used if project has specifically been specified to be saved to a certain path
   */
  public async saveProject(id: UUID, pathToProject?: PathLike): Promise<void> {
    const project = this.projectManager.getProject(id);
    if (!project) return;

    let path: string | undefined = "";
    if (!project.location) {
      path = await showSaveDialog({
        title: "Save Project",
        defaultPath: join(app.getPath("downloads"), project.name),
        filters: [{ name: "Blix Project", extensions: ["blix"] }],
      });
    }

    if (path) {
      project.location = path;
    } else if (pathToProject) {
      project.location = pathToProject;
    }
    project.rename((project.location as string).split(".blix")[0]);

    const graphs = project.graphs.map((g) => this._graphManager.getGraph(g));
    const exporter = new CoreGraphExporter<GraphToJSON>(new GraphFileExportStrategy());
    const exportedGraphs = graphs.map((g) => exporter.exportGraph(g));

    const projectFile: ProjectFile = {
      layout: project.layout,
      graphs: exportedGraphs,
    };

    if (project.location) {
      logger.info(project.location);
      writeFile(project.location, JSON.stringify(projectFile), (err) => {
        logger.info(err);
      });
    }
  }
  /**
   * This function provides a dialog box for a user to select one or multiple .blix project files to
   * open in their current editor window.
   * It also then loads the graphs for the projects.
   *
   * @returns Nothing
   */
  public async importProject(): Promise<void> {
    const paths = await showOpenDialog({
      title: "Import Project",
      defaultPath: app.getPath("downloads"),
      filters: [{ name: "Blix Project", extensions: ["blix"] }],
      properties: ["openFile", "multiSelections"],
    });

    if (!paths) return;
    const projects: SharedProject[] = [];
    for (const path of paths) {
      const project = await readFile(path, "utf-8");
      const projectFile = JSON.parse(project) as ProjectFile;
      const projectName = path.split("/").pop()?.split(".blix")[0];
      const uuid = this.projectManager.loadProject(projectName!, projectFile, path);
      const coreProject = this.projectManager.getProject(uuid);
      for (const graph of projectFile.graphs) {
        const coreGraph = this.graphManager.importGraph("json", graph);
        coreProject?.addGraph(coreGraph.uuid);
      }
      projects.push(coreProject!.toSharedProject());
    }
    this._mainWindow.apis.projectClientApi.loadProjects(projects);
  }

  get toolbox(): ToolboxRegistry {
    return this._toolbox;
  }

  get tileRegistry(): TileRegistry {
    return this._tileRegistry;
  }

  get commandRegistry(): CommandRegistry {
    return this._commandRegistry;
  }

  get graphManager(): CoreGraphManager {
    return this._graphManager;
  }

  get projectManager(): ProjectManager {
    return this._projectManager;
  }

  get mainWindow(): MainWindow | null {
    return this._mainWindow;
  }
}
