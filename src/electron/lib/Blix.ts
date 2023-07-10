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

import type { ProjectFile } from "./projects/CoreProject";
import {
  CoreGraphExporter,
  GraphFileExportStrategy,
  type GraphToJSON,
} from "./core-graph/CoreGraphExporter";
import { writeFileSync } from "fs";
import { app } from "electron";
import { join } from "path";

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
  }

  // NOTICE: Potentially move these methods to commands later

  /**
   *
   *
   * @param id Project to be exported
   * @param path System path to export project to
   */
  public exportProject(id: UUID, path: string) {
    const project = this.projectManager.getProject(id);
    if (!project) return;
    const graphs = project.graphs.map((g) => this._graphManager.getGraph(g));
    const exporter = new CoreGraphExporter<GraphToJSON>(new GraphFileExportStrategy());
    const exportedGraphs = graphs.map((g) => exporter.exportGraph(g));

    const projectFile: ProjectFile = {
      name: project.name,
      layout: project.layout,
      graphs: exportedGraphs,
    };

    // TODO: Save the file disk

    throw Error("Export project not implemented");
  }

  public importProject() {
    // TODO: Kinda follow exact strategy as above but now just for importing
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
