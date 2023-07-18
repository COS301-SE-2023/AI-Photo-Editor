import type { ElectronMainApi } from "electron-affinity/main";
import { NodeInstance } from "../../registries/ToolboxRegistry";
import type { Blix } from "../../Blix";

export class ToolboxApi implements ElectronMainApi<ToolboxApi> {
  private readonly blix: Blix;

  constructor(blix: Blix) {
    this.blix = blix;
  }

  async addNode(instance: NodeInstance) {
    this.blix.toolbox.addInstance(instance);
  }

  async getNodes() {
    return this.blix.toolbox.getNodes();
  }
}
