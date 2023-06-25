import type { ElectronMainApi } from "electron-affinity/main";
import { CommandInstance, CommandRegistry } from "../commands/CommandRegistry";
import type { Blix } from "../Blix";
import logger from "../../utils/logger";

export class ToolboxApi implements ElectronMainApi<ToolboxApi> {
  private _counter = 0;
  private readonly _blix: Blix;

  constructor(blix: Blix) {
    this._blix = blix;
  }

  async addNode(instance: CommandInstance) {
    this._blix.commandRegistry.addInstance(instance);
  }

  // async runCommand(command: string) {
  //   this._blix.commandRegistry.runCommand(command);
  // }

  async getNodes() {
    return this._blix.toolbox.getNodes();
  }
}
