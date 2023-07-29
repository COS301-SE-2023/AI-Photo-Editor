import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { type UUID } from "../../../../shared/utils/UniqueEntity";

export class MediaApi implements ElectronMainApi<MediaApi> {
  private readonly _blix: Blix;

  constructor(blix: Blix) {
    this._blix = blix;
  }

  // TODO: Implement these properly
  async compute(graphUUID: UUID, nodeUUID: UUID) {
    return this._blix.graphInterpreter.run(this._blix.graphManager.getGraph(graphUUID), nodeUUID);
  }
}
