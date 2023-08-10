import type { ElectronMainApi } from "electron-affinity/main";
import type { Command, CommandContext } from "../../registries/CommandRegistry";
import type { Blix } from "../../Blix";
import type { CommandResponse } from "../../../../shared/types/index";

export class CommandApi implements ElectronMainApi<CommandApi> {
  private readonly blix: Blix;

  constructor(blix: Blix) {
    this.blix = blix;
  }

  async addCommand(instance: Command) {
    this.blix.commandRegistry.addInstance(instance);
  }

  async runCommand(id: string, params?: any): Promise<CommandResponse> {
    return await this.blix.commandRegistry.runCommand(id, params);
  }

  async getCommands() {
    return this.blix.commandRegistry.getCommands();
  }
}
