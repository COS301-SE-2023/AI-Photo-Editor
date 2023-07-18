import { writable, get } from "svelte/store";
import { projectsStore } from "./ProjectStore";
import type { ICommand } from "@shared/types";

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

  async function runCommand(id: string) {
    if (id in blixCommandParams) {
      await window.apis.commandApi.runCommand(id, blixCommandParams[id]());
    } else {
      await window.apis.commandApi.runCommand(id);
    }
  }

  return {
    subscribe,
    addCommands,
    runCommand,
    refreshStore,
  };
}

// ========== Native Command Parameters ==========

const blixCommandParams: Record<string, () => any> = {
  "blix.projects.save": () => {
    const project = get(projectsStore).activeProject;
    return {
      projectId: project?.id,
      layout: project?.layout.saveLayout(),
    };
  },
};

export const commandStore = createCommandStore();
