import type { ElectronWindowApi } from "electron-affinity/window";
import { commandStore, type Command } from "../stores/CommandStore";

export class CommandRegistryApi implements ElectronWindowApi<CommandRegistryApi> {
  registryChanged(results: Command[]) {
    commandStore.refreshStore(results);
  }
}
