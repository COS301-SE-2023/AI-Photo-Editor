import type { ElectronMainApi } from "electron-affinity/main";
import { CommandInstance, CommandRegistry } from "../../registries/CommandRegistry";
import type { Blix } from "../../Blix";
import logger from "../../../utils/logger";

// Exposes all possible commands stored in the registry (plugin and blix commands)
export class CommandApi implements ElectronMainApi<CommandApi> {
  private _counter = 0;
  private readonly _blix: Blix;

  constructor(blix: Blix) {
    this._blix = blix;
  }

  async addCommand(instance: CommandInstance) {
    this._blix.commandRegistry.addInstance(instance);
  }

  async runCommand(command: string, options?: { data: any }) {
    this._blix.commandRegistry.runCommand(command, options);
  }

  async getCommands() {
    return this._blix.commandRegistry.getCommands();
  }
}
