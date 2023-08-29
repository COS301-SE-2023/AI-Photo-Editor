import type { DisplayableMediaOutput, MediaOutputId } from "@shared/types/media";
import type { ElectronWindowApi } from "electron-affinity/window";
import { mediaStore } from "@frontend/lib/stores/MediaStore";

export class MediaClientApi implements ElectronWindowApi<MediaClientApi> {
  outputChanged(mediaOutput: DisplayableMediaOutput): void {
    mediaStore.refreshStore(mediaOutput);
  }

  public onMediaOutputIdsChanged(outputIds: Set<MediaOutputId>) {
    mediaStore.updateOutputIds(outputIds);
  }
}
