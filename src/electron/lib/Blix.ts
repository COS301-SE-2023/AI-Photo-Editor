import { CommandRegistry } from "./registries/CommandRegistry";
import { NodeInstance, ToolboxRegistry } from "./registries/ToolboxRegistry";
import { TileRegistry } from "./registries/TileRegistry";
import { ProjectManager } from "./projects/ProjectManager";
import type { MainWindow } from "./api/apis/WindowApi";
import { CoreGraphManager } from "./core-graph/CoreGraphManager";
import { PluginManager } from "./plugins/PluginManager";
import { IPCGraphSubscriber } from "./core-graph/CoreGraphInteractors";
import type { UUID } from "../../shared/utils/UniqueEntity";
import type { UIGraph } from "../../shared/ui/UIGraph";
import { blixCommands } from "./BlixCommands";
import logger from "../utils/logger";
import { AiManager } from "./ai/AiManager";
import { NodeBuilder, NodeUIBuilder } from "./plugins/builders/NodeBuilder";

// Encapsulates the backend representation for
// the entire running Blix application
export class Blix {
  private _toolboxRegistry!: ToolboxRegistry;
  private _tileRegistry: TileRegistry;
  private _commandRegistry: CommandRegistry;
  private _graphManager!: CoreGraphManager;
  private _projectManager!: ProjectManager;
  private _pluginManager!: PluginManager;
  private _mainWindow!: MainWindow;
  private _aiManager!: AiManager;

  // private startTime: Date;

  // TODO: We'll need a layout registry as well which can save its state to a file
  // private layoutRegistry: LayoutRegistry;
  // private currentLayout: LayoutId;

  constructor() {
    // this.startTime = new Date();
    this._commandRegistry = new CommandRegistry(this);
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
    this._toolboxRegistry = new ToolboxRegistry(mainWindow);

    for (const command of blixCommands) {
      this.commandRegistry.addInstance(command);
    }

    // Load plugins before instantiating any managers
    this._pluginManager = new PluginManager(this);
    await this._pluginManager.loadBasePlugins();

    this._graphManager = new CoreGraphManager(mainWindow, this._toolboxRegistry);
    this._aiManager = new AiManager(mainWindow);
    this.aiManager.instantiate(this.toolbox);
    this._projectManager = new ProjectManager(mainWindow);

    // Add subscribers
    const graphSubscriber = new IPCGraphSubscriber();

    graphSubscriber.listen = (graphId: UUID, newGraph: UIGraph) => {
      mainWindow.apis.graphClientApi.graphChanged(graphId, newGraph);
    };

    this._graphManager.addAllSubscriber(graphSubscriber);

    // testStuffies(this);

    // TESTING ADD NODE TO GRAPH
    // setInterval(() => {
    //   const allIds = this._graphManager.getAllGraphUUIDs();

    //   const randId = allIds[Math.floor(Math.random() * allIds.length)];
    //   const toolbox = this._toolboxRegistry.getRegistry();
    //   const toolboxKeys = Object.keys(toolbox);
    //   const randomNode = toolbox[toolboxKeys[Math.floor(Math.random() * toolboxKeys.length)]];

    //   this._graphManager.addNode(randId, randomNode);
    // }, 3000);
  }

  // TODO: Move these to a Utils.ts or something like that
  sendInformationMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "info" });
  }

  sendWarnMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "warn" });
  }

  sendErrorMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "error" });
  }

  sendSuccessMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "success" });
  }

  get toolbox(): ToolboxRegistry {
    return this._toolboxRegistry;
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

  get aiManager(): AiManager {
    return this._aiManager;
  }

  get mainWindow(): MainWindow | null {
    return this._mainWindow;
  }
}
