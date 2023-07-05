import { writable, get } from "svelte/store";
import type { ICommand } from "../../../shared/types/index";
import { projectsStore } from "./ProjectStore";

interface CommandStore {
  commands: ICommand[];
}

function createCommandStore() {
  const { subscribe, set } = writable<CommandStore>({
    commands: [],
  });

  // Called when the command registry changes
  // Automatically updates the value of the store
  function refreshStore(results: ICommand[]) {
    set({ commands: results });
  }

  async function addCommands(cmds: any[]) {
    // window.apis.pluginApi.addCommand(cmds);
  }

  async function runCommand(cmd: string) {
    let options: { data: any } = { data: null };
    // console.log(cmd)
    // console.log(projectManager.getActiveProject().getId())
    if (cmd === "base-plugin.saveas") {
      options = { data: get(projectsStore).activeProject?.id };
    }
    // console.log(options.data)
    await window.apis.commandApi.runCommand(cmd, options);
  }

  return {
    subscribe,
    addCommands,
    runCommand,
    refreshStore,
  };
}

export const commandStore = createCommandStore();
