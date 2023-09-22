import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import type { CommandResponse } from "../../../../shared/types/index";
import { URL } from "url";

type PluginSignature = string;

export class PluginApi implements ElectronMainApi<PluginApi> {
  private readonly blix: Blix;

  constructor(blix: Blix) {
    this.blix = blix;
  }

  async enablePlugin(plugin: PluginSignature) {
    // this.blix.commandRegistry.addInstance(instance);
  }
  async disablePlugin(plugin: PluginSignature) {
    // this.blix.commandRegistry.addInstance(instance);
  }

  async installPlugin(url: URL) {
    // return await this.blix.commandRegistry.runCommand(id, params);
  }

  async uninstallPlugin(url: URL) {
    // return await this.blix.commandRegistry.runCommand(id, params);
  }

  async getInstalledPlugins() {
    return this.blix.pluginManager.pluginPaths;
  }
}
