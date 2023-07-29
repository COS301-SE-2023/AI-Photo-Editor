import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { type UUID } from "../../../../shared/utils/UniqueEntity";
import { type MediaOutputId } from "@shared/types/media";
import { MediaSubscriber } from "../../media/MediaSubscribers";

export class MediaApi implements ElectronMainApi<MediaApi> {
  private readonly _blix: Blix;

  constructor(blix: Blix) {
    this._blix = blix;
  }

  async subscribeToMedia(mediaId: MediaOutputId) {
    // const subscriber = new MediaSubscriber();
    // this._blix.mediaManager.addSubscriber(mediaId, subscriber);
  }

  // async compute(graphUUID: UUID, nodeUUID: UUID) {
  //   return this._blix.graphInterpreter.run(this._blix.graphManager.getGraph(graphUUID), nodeUUID);
  // }
}
