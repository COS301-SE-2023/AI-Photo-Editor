import type { ElectronWindowApi } from "electron-affinity/window";

export class MediaClientApi implements ElectronWindowApi<MediaClientApi> {
  outputChanged(): void {
    // console.log("output changed");
  }
}
