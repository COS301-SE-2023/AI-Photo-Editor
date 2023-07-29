import { type MediaOutputId, type MediaOutput } from "@shared/types/media";

export class MediaSubscriber {
  // Index of the subscriber in CoreGraphManager's _subscribers list
  protected _subscriberIndex = -1;
  protected _notifyee?: (media: MediaOutput) => void; // Callback when graph changes

  public set listen(notifyee: (media: MediaOutput) => void) {
    this._notifyee = notifyee;
  }

  public set subscriberIndex(index: number) {
    this._subscriberIndex = index;
  }

  public get subscriberIndex() {
    return this._subscriberIndex;
  }

  // Calls _notifyee with the new media state
  onMediaChanged(mediaOutput: MediaOutput) {
    if (this._notifyee) this._notifyee(mediaOutput);
  }
}
