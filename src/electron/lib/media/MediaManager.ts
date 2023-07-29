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
  private _mediaByGraph: { [key: UUID]: MediaOutputId[] };

  constructor(
    mainWindow: MainWindow,
    graphInterpreter: CoreGraphInterpreter,
    graphManager: CoreGraphManager
  ) {
    this._mainWindow = mainWindow;
    this._subscribers = {};
    this._mediaByGraph = {};
    this._graphInterpreter = graphInterpreter;
    this._graphManager = graphManager;

    this.media = {};

    // this.addSubscriber();
  }

  // addNode(graphMediaId: MediaOutputId, node: NodeInstance): QueryResponse<{ nodeId: MediaOutputId }> {
  //   if (res.status === "success") this.onMediaUpdated(graphUUID);
  // }

  updateMedia(mediaOutput: MediaOutput) {
    this.media[mediaOutput.outputId] = mediaOutput;
    this.onMediaUpdated(mediaOutput.outputId);
  }

  getMedia(mediaOutputId: MediaOutputId) {
    return this.media[mediaOutputId];
  }

  onGraphUpdated(graphUUID: UUID) {
    // Update media for all nodes that have subscribers

    // Build set of outputs to recompute
    const outputsToRecompute = new Set<MediaOutputId>();

    // for (const mediaId of this._subscribersByGraph[graphUUID]) {
    //   const subscribers = this._subscribers[mediaId];
    // }

    // const media = this.computeMedia(graphUUID, nodeUUID, nodeUUID);
    // this.media[media.outputId] = media;
    // this.onMediaUpdated(media.outputId);
  }

  // Notify all subscribers of media change
  onMediaUpdated(mediaId: MediaOutputId) {
    if (this._subscribers[mediaId] !== undefined) {
      this._subscribers[mediaId].forEach((subscriber) => {
        subscriber.onMediaChanged(this.media[mediaId]);
      });
    }
  }

  computeMedia(graphUUID: UUID, nodeUUID: UUID, nodeMediaId: MediaOutputId) {
    return this._graphInterpreter.run(this._graphManager.getGraph(graphUUID), nodeUUID);
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
