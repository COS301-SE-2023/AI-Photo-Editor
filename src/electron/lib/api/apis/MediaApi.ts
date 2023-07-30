import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { type UUID } from "../../../../shared/utils/UniqueEntity";
import { type MediaOutput, type MediaOutputId } from "../../../../shared/types/media";
import { MediaSubscriber } from "../../media/MediaSubscribers";

export class MediaApi implements ElectronMainApi<MediaApi> {
  private readonly _blix: Blix;
  private mediaSubscribers: {
    [key: MediaOutputId]: { subscriber: MediaSubscriber; subCount: number };
  };

  constructor(blix: Blix) {
    this._blix = blix;
    this.mediaSubscribers = {};
  }

  async unsubscribeFromMedia(mediaId: MediaOutputId) {
    if (this.mediaSubscribers[mediaId]) {
      this.mediaSubscribers[mediaId].subCount--;

      if (this.mediaSubscribers[mediaId].subCount <= 0) {
        this._blix.mediaManager.removeSubscriber(
          mediaId,
          this.mediaSubscribers[mediaId].subscriber.uuid
        );
        delete this.mediaSubscribers[mediaId];
      }
    }
    // console.log("\nUNSUBBED", mediaId);
    // for (const mediaId of Object.keys(this.mediaSubscribers)) {
    //   console.log(mediaId, this.mediaSubscribers[mediaId].subCount);
    // }
  }

  async subscribeToMedia(mediaId: MediaOutputId) {
    if (!this.mediaSubscribers[mediaId]) {
      const mediaSubscriber = new MediaSubscriber();

      mediaSubscriber.listen = (media: MediaOutput) => {
        this._blix.mainWindow?.apis.mediaClientApi.outputChanged(media);
      };

      this.mediaSubscribers[mediaId] = { subscriber: mediaSubscriber, subCount: 0 };

      this._blix.mediaManager.addSubscriber(mediaId, this.mediaSubscribers[mediaId].subscriber);
    }

    this.mediaSubscribers[mediaId].subCount++;
    // console.log("\nSUBBED", mediaId);
    // for (const mediaId of Object.keys(this.mediaSubscribers)) {
    //   console.log(mediaId, this.mediaSubscribers[mediaId].subCount);
    // }
  }

  // async compute(graphUUID: UUID, nodeUUID: UUID) {
  //   return this._blix.graphInterpreter.run(this._blix.graphManager.getGraph(graphUUID), nodeUUID);
  // }
}
