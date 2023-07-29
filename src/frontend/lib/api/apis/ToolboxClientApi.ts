import type { ElectronWindowApi } from "electron-affinity/window";
import type { INode } from "@shared/ui/ToolboxTypes";
import { toolboxStore } from "@frontend/lib/stores/ToolboxStore";

export class ToolboxClientApi implements ElectronWindowApi<ToolboxClientApi> {
  registryChanged(results: INode[]) {
    toolboxStore.refreshStore(results);
  }
}
