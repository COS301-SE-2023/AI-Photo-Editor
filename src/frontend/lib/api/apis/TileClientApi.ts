import type { ITile } from "@shared/ui/TileUITypes";
import type { ElectronWindowApi } from "electron-affinity/window";
import { tileStore } from "../../stores/TileStore";

export class TileClientApi implements ElectronWindowApi<TileClientApi> {
  registryChanged(results: ITile[]) {
    tileStore.refreshStore(results);
  }
}
