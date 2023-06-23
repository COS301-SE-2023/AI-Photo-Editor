import type { ElectronMainApi } from "electron-affinity/main";
import { CommandInstance, CommandRegistry } from "../commands/CommandRegistry";
import type { Blix } from "../Blix";

import logger from "../../utils/logger";

export class PluginApi implements ElectronMainApi<PluginApi> {
  private _counter = 0;
  private registry: { [key: string]: CommandInstance };

  constructor(private readonly _blix: Blix) {
    this.registry = _blix.commandRegistry.getRegistry();
  }

  async addCommand(instance: CommandInstance) {
    this._blix.commandRegistry.addInstance(instance);
  }

  async runCommand() {
    this._blix.commandRegistry.getRegistry();
  }
}
