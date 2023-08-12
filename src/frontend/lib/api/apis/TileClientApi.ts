import type { ElectronWindowApi } from "electron-affinity/window";

export class TileClientApi implements ElectronWindowApi<TileClientApi> {
  registryChanged(results: string) {
    return;
  }
}
