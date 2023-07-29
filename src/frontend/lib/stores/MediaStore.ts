import type { IOutputNode } from "@shared/types/media";
import { writable } from "svelte/store";

type Media = {
  outputNodes: IOutputNode[];
};

class MediaStore {
  private store = writable<Media>({ outputNodes: [] });

  public refreshStore(outputNode: IOutputNode) {
    this.store.update((media) => {
      media.outputNodes.push(outputNode);

      return media;
    });
  }
  // Update the types of params
  public async compute(graphUUID: string, nodeUUID: string) {
    await window.apis.mediaApi.compute(graphUUID, nodeUUID);
  }

  public get subscribe() {
    return this.store.subscribe;
  }
}

export const mediaStore = new MediaStore();
