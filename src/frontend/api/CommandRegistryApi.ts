import type { ElectronWindowApi } from "electron-affinity/window";
import { commandStore } from "../stores/CommandStore";

export class CommandRegistryApi implements ElectronWindowApi<CommandRegistryApi> {
  registryChanged(results: string[]) {
    commandStore.refreshStore(results);
  }
}
