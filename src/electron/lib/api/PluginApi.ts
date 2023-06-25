import type { ElectronMainApi } from "electron-affinity/main";
import { CommandInstance, CommandRegistry } from "../commands/CommandRegistry";
import type { Blix } from "../Blix";
import logger from "../../utils/logger";

export class PluginApi implements ElectronMainApi<PluginApi> {
  private _counter = 0;
  private readonly _blix: Blix;

  constructor(blix: Blix) {
    this._blix = blix;
  }

  async addCommand(instance: CommandInstance) {
    this._blix.commandRegistry.addInstance(instance);
  }

  async runCommand(command: string) {
    this._blix.commandRegistry.runCommand(command);
  }

  async getCommands() {
    return this._blix.commandRegistry.getCommands();
  }
}
