import { type MainWindow } from "../api/apis/WindowApi";
import { MediaSubscriber } from "./MediaSubscribers";
import { CoreGraphInterpreter } from "../core-graph/CoreGraphInterpreter";
import { type UUID } from "../../../shared/utils/UniqueEntity";
import {
  MediaDisplayType,
  type MediaDisplayConfig,
  type MediaOutput,
  type MediaOutputId,
} from "../../../shared/types/media";
import { CoreGraphManager } from "../core-graph/CoreGraphManager";
import { TypeclassRegistry } from "../registries/TypeclassRegistry";

export class MediaManager {
  private media: { [key: MediaOutputId]: MediaOutput };
  private _typeclassRegistry: TypeclassRegistry;
  private _graphInterpreter: CoreGraphInterpreter;
  private _graphManager: CoreGraphManager;

  // Subscribers that are listening on the MediaManager
  private _subscribers: { [key: MediaOutputId]: { [key: UUID]: MediaSubscriber } };

  constructor(
    typeclassRegistry: TypeclassRegistry,
    graphInterpreter: CoreGraphInterpreter,
    graphManager: CoreGraphManager
  ) {
    this._typeclassRegistry = typeclassRegistry;
    this._subscribers = {};
    this._graphInterpreter = graphInterpreter;
    this._graphManager = graphManager;

    this.media = {};
  }

  updateMedia(mediaOutput: MediaOutput) {
    this.media[mediaOutput.outputId] = mediaOutput;
    this.onMediaUpdated(mediaOutput.outputId);
  }

  getMedia(mediaOutputId: MediaOutputId) {
    return this.media[mediaOutputId];
  }

  onGraphUpdated(graphUUID: UUID) {
    // Update media for all nodes that have subscribers
    const graphOutputNodes = this._graphManager.getGraph(graphUUID).getOutputNodes;

    const nodesToRecompute = new Set<UUID>();

    for (const nodeUUID of Object.keys(graphOutputNodes)) {
      const mediaId = graphOutputNodes[nodeUUID];

      // Only update if there are actually subscribers to this media output
      // if (this._subscribers[mediaId]) {
      nodesToRecompute.add(nodeUUID);
      // }
    }

    for (const nodeUUID of nodesToRecompute) {
      this.computeMedia(graphUUID, nodeUUID);
      // The output node after each computation will call updateMedia()
      // which then alerts all subscribers of the media change
    }
  }

  // Notify all subscribers of media change
  onMediaUpdated(mediaId: MediaOutputId) {
    if (this._subscribers[mediaId] !== undefined) {
      const displayableMedia = this._typeclassRegistry.getDisplayableMedia(this.media[mediaId]);

      Object.keys(this._subscribers[mediaId]).forEach((subscriberUUID) => {
        this._subscribers[mediaId][subscriberUUID].onMediaChanged(displayableMedia);
      });
    }
  }

  computeMedia(graphUUID: UUID, nodeUUID: UUID) {
    return this._graphInterpreter.run(this._graphManager.getGraph(graphUUID), nodeUUID);
  }

  removeSubscriber(mediaId: MediaOutputId, subscriberUUID: UUID) {
    if (this._subscribers[mediaId] !== undefined) {
      delete this._subscribers[mediaId][subscriberUUID];
    }
    if (Object.keys(this._subscribers[mediaId]).length === 0) {
      delete this._subscribers[mediaId];
    }
  }

  // Subscribe to a specific graph's events
  addSubscriber(mediaId: MediaOutputId, subscriber: MediaSubscriber) {
    if (this._subscribers[mediaId] === undefined) {
      this._subscribers[mediaId] = {};
    }

    this._subscribers[mediaId][subscriber.uuid] = subscriber;
  }
}
