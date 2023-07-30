import type { MediaOutput } from "@shared/types/media";
import type { ElectronWindowApi } from "electron-affinity/window";
import { mediaStore } from "@frontend/lib/stores/MediaStore";

export class MediaClientApi implements ElectronWindowApi<MediaClientApi> {
  outputChanged(mediaOutput: MediaOutput): void {
    mediaStore.refreshStore(mediaOutput);
  }
}
