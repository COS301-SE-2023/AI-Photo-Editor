import { type MainWindow } from "../api/apis/WindowApi";
import { MediaSubscriber } from "./MediaSubscribers";
import { CoreGraphInterpreter } from "../core-graph/CoreGraphInterpreter";
import { type UUID } from "@shared/utils/UniqueEntity";
import { type MediaOutput, type MediaOutputId } from "@shared/types/media";
import { CoreGraphManager } from "../core-graph/CoreGraphManager";

export class MediaManager {
  private media: { [key: MediaOutputId]: MediaOutput };
  private _mainWindow: MainWindow;
  private _graphInterpreter: CoreGraphInterpreter;
  private _graphManager: CoreGraphManager;

  // Subscribers that are listening on the MediaManager
  private _subscribers: { [key: MediaOutputId]: MediaSubscriber[] };

  constructor(
    mainWindow: MainWindow,
    graphInterpreter: CoreGraphInterpreter,
    graphManager: CoreGraphManager
  ) {
    this._mainWindow = mainWindow;
    this._subscribers = {};
    this._graphInterpreter = graphInterpreter;
    this._graphManager = graphManager;

    this.media = {};
  }

  // addNode(graphMediaId: MediaOutputId, node: NodeInstance): QueryResponse<{ nodeId: MediaOutputId }> {
  //   if (res.status === "success") this.onMediaUpdated(graphUUID);
  // }

  getMedia(uuid: MediaOutputId) {
    return this.media[uuid];
  }

  onGraphUpdated(graphUUID: UUID) {
    // const media = this.computeMedia(graphUUID, nodeUUID, nodeUUID);
    // this.media[media.outputId] = media;
    // this.onMediaUpdated(media.outputId);
  }

  // Notify all subscribers of media change
  onMediaUpdated(mediaId: MediaOutputId) {
    if (this._subscribers[mediaId] !== undefined) {
      this._subscribers[mediaId].forEach((subscriber) => {
        subscriber.onMediaChanged(mediaId, this.media[mediaId]);
      });
    }
    if (this._subscribers.all !== undefined) {
      this._subscribers.all.forEach((subscriber) => {
        subscriber.onMediaChanged(mediaId, this.media[mediaId]);
      });
    }
  }

  computeMedia(graphUUID: UUID, nodeUUID: UUID, nodeMediaId: MediaOutputId) {
    return this._graphInterpreter.run(this._graphManager.getGraph(graphUUID), nodeUUID);
  }

  // Subscribe to all graph events
  addAllSubscriber(subscriber: MediaSubscriber) {
    if (this._subscribers.all === undefined) {
      this._subscribers.all = [];
    }

    subscriber.subscriberIndex = this._subscribers.all.length;
    this._subscribers.all.push(subscriber);
  }

  // Subscribe to a specific graph's events
  addSubscriber(mediaId: MediaOutputId, subscriber: MediaSubscriber) {
    if (this._subscribers[mediaId] === undefined) {
      this._subscribers[mediaId] = [];
    }

    subscriber.subscriberIndex = this._subscribers[mediaId].length;
    this._subscribers[mediaId].push(subscriber);
  }

  removeSubscriber() {
    return;
  }
}
