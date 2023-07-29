import type { MediaOutput, MediaOutputId } from "@shared/types/media";
import type { GraphNodeUUID, GraphUUID } from "@shared/ui/UIGraph";
import { derived, get, writable } from "svelte/store";
import { graphMall } from "./GraphStore";

type MediaOutputs = {
  [key: GraphNodeUUID]: MediaOutput;
};

class MediaStore {
  private mediaStore = writable<MediaOutputs>({});

  public refreshStore(media: MediaOutput) {
    // Refresh media store
    this.mediaStore.update((mediaOutputs) => {
      mediaOutputs[media.outputNodeUUID] = media;
      return mediaOutputs;
    });
  }

  // Update the types of params
  // public async compute(graphUUID: string, nodeUUID: string) {
  //   await window.apis.mediaApi.compute(graphUUID, nodeUUID);
  // }

  // Stop listening for graph changes
  public stopMediaReactive(graphUUID: GraphUUID, outputNodeUUID: GraphNodeUUID) {
    // TODO
    return;
  }

  public getMediaReactive(graphUUID: GraphUUID, outputNodeUUID: GraphNodeUUID) {
    // TODO: Optimize this with a proper subscription system
    // that only listens for updates to the requested id specifically
    return derived(mediaStore, (store) => {
      return store[outputNodeUUID];
    });
  }

  public get subscribe() {
    return this.mediaStore.subscribe;
  }
}

export const mediaStore = new MediaStore();
