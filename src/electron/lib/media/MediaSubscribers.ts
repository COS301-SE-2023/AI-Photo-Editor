import { type MediaOutput } from "@shared/types/media";
import { type UUID } from "@shared/utils/UniqueEntity";

export class MediaSubscriber {
  // Index of the subscriber in CoreGraphManager's _subscribers list
  protected _subscriberIndex = -1;
  protected _notifyee?: (graphId: UUID, media: MediaOutput) => void; // Callback when graph changes

  public set listen(notifyee: (graphId: UUID, media: MediaOutput) => void) {
    this._notifyee = notifyee;
  }

  public set subscriberIndex(index: number) {
    this._subscriberIndex = index;
  }

  public get subscriberIndex() {
    return this._subscriberIndex;
  }

  // Calls _notifyee with the new media state
  onMediaChanged(graphId: UUID, media: MediaOutput) {
    if (this._notifyee) this._notifyee(graphId, media);
  }
}

// export class BackendSystemGraphSubscriber extends CoreGraphSubscriber<CoreGraph> {
//   onGraphChanged(graphId: UUID, graphData: CoreGraph): void {
//     if (this._notifyee) this._notifyee(graphId, graphData);
//   }
// }
