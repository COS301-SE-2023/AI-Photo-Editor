import { CommandRegistry } from "./commands/CommandRegistry";
import { ToolboxRegistry } from "./core-graph/ToolboxRegistry";
import { TileRegistry } from "./tiles/TileRegistry";
import { ProjectManager } from "./projects/ProjectManager";
import type { MainWindow } from "./api/WindowApi";
import { GraphManager } from "./core-graph/GraphManager";

import type { UIGraph } from "@frontend/stores/GraphStore";

// Encapsulates the backend representation for
// the entire running Blix application
export class Blix {
  private _toolbox: ToolboxRegistry;
  private _tileRegistry: TileRegistry;
  private _commandRegistry: CommandRegistry;
  private _graphManager: GraphManager;
  private _projectManager: ProjectManager;
  private _mainWindow: MainWindow | null;

  // private startTime: Date;

  // TODO: We'll need a layout registry as well which can save its state to a file
  // private layoutRegistry: LayoutRegistry;
  // private currentLayout: LayoutId;

  constructor() {
    // this.startTime = new Date();
    this._toolbox = new ToolboxRegistry();
    this._commandRegistry = new CommandRegistry();
    this._tileRegistry = new TileRegistry();
    this._graphManager = new GraphManager();
    this._projectManager = new ProjectManager();
    this._mainWindow = null;

    this._graphManager.createGraph(); // TODO: REMOVE; This is just for testing

    // temp for testing
    const ids = this.graphManager.getAllGraphUUIDs();

    setInterval(() => {
      if (this.mainWindow)
        this.mainWindow?.apis.coreGraphApi.graphChanged(ids[0], { uuid: ids[0] } as UIGraph);
    }, 1000);
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

  get graphManager(): GraphManager {
    return this._graphManager;
  }

  get projectManager(): ProjectManager {
    return this._projectManager;
  }

  get mainWindow(): MainWindow | null {
    return this._mainWindow;
  }

  set mainWindow(mainWindow: MainWindow | null) {
    this._mainWindow = mainWindow;
  }
}
