import type { MediaOutput, MediaOutputId } from "@shared/types/media";
import type { GraphNodeUUID } from "@shared/ui/UIGraph";
import { derived, writable } from "svelte/store";

type MediaOutputs = {
  [key: MediaOutputId]: MediaOutput;
};

class MediaStore {
  private mediaStore = writable<MediaOutputs>({});

  public refreshStore(media: MediaOutput) {
    this.mediaStore.update((mediaOutputs) => {
      mediaOutputs[media.outputNodeUUID] = media;
      return mediaOutputs;
    });
  }

  // Update the types of params
  public async compute(graphUUID: string, nodeUUID: string) {
    await window.apis.mediaApi.compute(graphUUID, nodeUUID);
  }

  public getMediaReactive(outputNodeUUID: GraphNodeUUID) {
    // TODO: Optimize this with a proper subscription system
    // that only listens for updates to the requested id specifically
    return derived(mediaStore, (media) => {
      return media[outputNodeUUID];
    });
  }

  public get subscribe() {
    return this.mediaStore.subscribe;
  }
}

export const mediaStore = new MediaStore();
