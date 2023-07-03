import { CommandRegistry } from "./registries/CommandRegistry";
import { NodeInstance, ToolboxRegistry } from "./registries/ToolboxRegistry";
import { TileRegistry } from "./registries/TileRegistry";
import { ProjectManager } from "./projects/ProjectManager";
import type { MainWindow } from "./api/apis/WindowApi";
import { CoreGraphManager } from "./core-graph/CoreGraphManager";
import { NodeBuilder, NodeUIBuilder } from "./plugins/builders/NodeBuilder";
import { NodeUI } from "../../shared/ui/NodeUITypes";

// Encapsulates the backend representation for
// the entire running Blix application
export class Blix {
  private _toolboxRegistry: ToolboxRegistry;
  private _tileRegistry: TileRegistry;
  private _commandRegistry: CommandRegistry;
  private _graphManager: CoreGraphManager;
  private _projectManager: ProjectManager;
  private _mainWindow: MainWindow;

  // private startTime: Date;

  // TODO: We'll need a layout registry as well which can save its state to a file
  // private layoutRegistry: LayoutRegistry;
  // private currentLayout: LayoutId;

  constructor(mainWindow: MainWindow) {
    // this.startTime = new Date();
    this._mainWindow = mainWindow;
    this._toolboxRegistry = new ToolboxRegistry(mainWindow);
    this._commandRegistry = new CommandRegistry();
    this._tileRegistry = new TileRegistry();
    this._graphManager = new CoreGraphManager(this, mainWindow);
    this._projectManager = new ProjectManager(mainWindow);

    // TESTING ADD NODE TO TOOLBOX
    // setInterval(() => {
    //   const nodeInstance = new NodeInstance("", "", "", "", "", "", [], []);
    //   const nodeUI = new NodeUI();
    //   const nodeBuilder = new NodeBuilder(nodeInstance).setUI(
    //     new NodeUIBuilder(nodeUI).addLabel("Test", "test")
    //   )

    //   this._toolboxRegistry.addInstance(nodeInstance);
    // }, 5000);
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

  get mainWindow(): MainWindow | null {
    return this._mainWindow;
  }
}
