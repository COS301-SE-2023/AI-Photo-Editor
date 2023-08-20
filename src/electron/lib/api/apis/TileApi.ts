import type { ElectronMainApi } from "electron-affinity/main";
import { TileInstance } from "../../registries/TileRegistry";
import type { Blix } from "../../Blix";

export class TileApi implements ElectronMainApi<TileApi> {
  private readonly blix: Blix;

  constructor(blix: Blix) {
    this.blix = blix;
  }

  async addNode(instance: TileInstance) {
    this.blix.tileRegistry.addInstance(instance);
  }

  async getTiles() {
    return this.blix.tileRegistry.getITiles();
  }
}
