import { BlixProject } from "./BlixProject";
import { CommandRegistry } from "./commands/CommandRegistry";
import { ToolboxRegistry } from "./core-graph/ToolboxRegistry";
import { TileRegistry } from "./tiles/TileRegistry";

// Encapsulates the backend representation for
// the entire running Blix application
export class Blix {
  private _toolbox: ToolboxRegistry;
  private _tileRegistry: TileRegistry;
  private _commandRegistry: CommandRegistry;
  private _openProjects: BlixProject[];

  private startTime: Date;

  // TODO: We'll need a layout registry as well which can save its state to a file
  // private layoutRegistry: LayoutRegistry;
  // private currentLayout: LayoutId;

  constructor() {
    this.startTime = new Date();
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
  get openProjects(): BlixProject[] {
    return this._openProjects;
  }
}
