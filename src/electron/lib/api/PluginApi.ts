import type { ElectronMainApi } from "electron-affinity/main";
import { CommandInstance, CommandRegistry } from "../commands/CommandRegistry";
import type { Blix } from "../Blix";
import { PluginManager } from "../plugins/PluginManager";
import logger from "../../utils/logger";

export class PluginApi implements ElectronMainApi<PluginApi> {
  private _counter = 0;
  private _registry: { [key: string]: CommandInstance };
  private readonly _blix: Blix;

  constructor(blix: Blix) {
    this._blix = blix;
    this._registry = this._blix.commandRegistry.getRegistry();
  }

  async addCommand(instance: CommandInstance) {
    this._blix.commandRegistry.addInstance(instance);
  }

  async runCommand() {
    // this._blix.commandRegistry.getRegistry();
  }

  async getCommands() {
    return this._blix.commandRegistry.getCommands();
  }
}
