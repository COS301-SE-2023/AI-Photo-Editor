import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { type UUID } from "../../../../shared/utils/UniqueEntity";

export class MediaApi implements ElectronMainApi<MediaApi> {
  private readonly _blix: Blix;

  constructor(blix: Blix) {
    this._blix = blix;
  }

  async computeAll(graphUUID: UUID) {
    // TODO: Find all output nodes and run them one by one
    // return this._blix.graphInterpreter.runAll(this._blix.graphManager.getGraph(graphUUID));
  }

  // TODO: Implement these properly
  async compute(graphUUID: UUID, nodeUUID: UUID) {
    return this._blix.graphInterpreter.run(this._blix.graphManager.getGraph(graphUUID), nodeUUID);
  }
}
