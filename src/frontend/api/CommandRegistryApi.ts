import type { ElectronWindowApi } from "electron-affinity/window";
import { commandStore } from "../stores/CommandStore";
import type { ICommand } from "../../shared/types/index";

export class CommandRegistryApi implements ElectronWindowApi<CommandRegistryApi> {
  registryChanged(results: ICommand[]) {
    commandStore.refreshStore(results);
  }
}
