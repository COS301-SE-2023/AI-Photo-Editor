import type { DisplayableMediaOutput, MediaOutputId } from "@shared/types/media";
import { derived, writable } from "svelte/store";
import { commandStore } from "./CommandStore";

type MediaOutputs = {
  [key: MediaOutputId]: DisplayableMediaOutput;
};

class MediaStore {
  private store = writable<MediaOutputs>({});
  private outputIds = writable<Set<MediaOutputId>>();

  public refreshStore(media: DisplayableMediaOutput) {
    // Refresh media store
    this.store.update((mediaOutputs) => {
      mediaOutputs[media.outputId] = media;
      return mediaOutputs;
    });
  }

  public updateOutputIds(ids: Set<MediaOutputId>) {
    this.outputIds.set(ids);
  }

  // Stop listening for graph changes
  // public stopMediaReactive(graphUUID: GraphUUID, outputNodeUUID: GraphNodeUUID) {
  public async stopMediaReactive(mediaId: MediaOutputId) {
    await window.apis.mediaApi.unsubscribeFromMedia(mediaId).catch((err) => {
      return;
    });
  }

  public async getMediaReactive(mediaId: MediaOutputId) {
    await window.apis.mediaApi.subscribeToMedia(mediaId).catch((err) => {
      return;
    });

    // TODO: Optimize this with a proper subscription system
    // that only listens for updates to the requested id specifically
    return derived(this.store, (store) => {
      return store[mediaId];
    });
  }

  public getMediaOutputIdsReactive() {
    return derived(this.outputIds, (store) => {
      return store;
    });
  }

  public async exportMedia(output: DisplayableMediaOutput) {
    return await commandStore.runCommand("blix.exportMedia", {
      type: output.dataType,
      data: output.content as string,
    });
  }

  public get subscribe() {
    return this.store.subscribe;
  }
}

export const mediaStore = new MediaStore();
