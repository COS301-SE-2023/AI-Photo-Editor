import { type MediaOutputId, type MediaOutput } from "@shared/types/media";
import { UniqueEntity } from "../../../shared/utils/UniqueEntity";

export class MediaSubscriber extends UniqueEntity {
  // Index of the subscriber in CoreGraphManager's _subscribers list
  protected _notifyee?: (media: MediaOutput) => void; // Callback when graph changes

  constructor() {
    super();
  }

  public set listen(notifyee: (media: MediaOutput) => void) {
    this._notifyee = notifyee;
  }

  // Calls _notifyee with the new media state
  onMediaChanged(mediaOutput: MediaOutput) {
    if (this._notifyee) this._notifyee(mediaOutput);
  }
}
