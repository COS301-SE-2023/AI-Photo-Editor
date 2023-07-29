import type { MediaOutput, MediaOutputId } from "@shared/types/media";
import type { GraphNodeUUID, GraphUUID } from "@shared/ui/UIGraph";
import { derived, get, writable } from "svelte/store";
import { graphMall } from "./GraphStore";

type MediaOutputs = {
  [key: GraphNodeUUID]: MediaOutput;
};

class MediaStore {
  private mediaStore = writable<MediaOutputs>({});
  private graphUnsubscribers: { [key: GraphUUID]: () => void } = {};

  public refreshStore(media: MediaOutput) {
    // Refresh media store
    this.mediaStore.update((mediaOutputs) => {
      mediaOutputs[media.outputNodeUUID] = media;
      return mediaOutputs;
    });
  }

  // Update the types of params
  public async compute(graphUUID: string, nodeUUID: string) {
    await window.apis.mediaApi.compute(graphUUID, nodeUUID);
  }

  // Stop listening for graph changes
  public stopMediaReactive(graphUUID: GraphUUID, outputNodeUUID: GraphNodeUUID) {
    // TODO
    return;
  }

  public getMediaReactive(graphUUID: GraphUUID, outputNodeUUID: GraphNodeUUID) {
    const media = get(mediaStore)[outputNodeUUID];

    if (!media) {
      // First time handling this media
      // Add listener on graph changed
      const selectedGraph = graphMall.getGraph(graphUUID);

      // TODO: Enable and properly handle this when graphs can be deleted
      // if (this.graphUnsubscribers[media.graphUUID]) this.graphUnsubscribers[media.graphUUID]();

      // this.graphUnsubscribers[graphUUID] = selectedGraph.subscribe((_) => {
      //   this.compute(graphUUID, outputNodeUUID).catch((err) => {
      //     // TODO: Handle this properly
      //     // this.mediaStore.update((mediaOutputs) => {
      //     //   mediaOutputs[outputNodeUUID] = {
      //     //     outputId: outputNodeUUID,
      //     //     outputNodeUUID,
      //     //     graphUUID,
      //     //     content: err,
      //     //     dataType: "Error",
      //     //   };
      //     //   return mediaOutputs;
      //     // });
      //   });
      // });
    }

    // TODO: Optimize this with a proper subscription system
    // that only listens for updates to the requested id specifically
    return derived(mediaStore, (medStore) => {
      return medStore[outputNodeUUID];
    });
  }

  public get subscribe() {
    return this.mediaStore.subscribe;
  }
}

export const mediaStore = new MediaStore();
