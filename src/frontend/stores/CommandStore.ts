import { writable } from "svelte/store";

export interface Command {
  signature: string;
  displayName: string;
  description: string;
  icon: string;
}

interface CommandStore {
  commands: Command[];
}

function createCommandStore() {
  const { subscribe, set } = writable<CommandStore>({
    commands: [],
  });

  // Called when the command registry changes
  // Automatically updates the value of the store
  function refreshStore(results: Command[]) {
    set({ commands: results });
  }

  async function addCommands(cmds: any[]) {
    // window.apis.pluginApi.addCommand(cmds);
  }

  async function runCommand(cmd: string) {
    await window.apis.pluginApi.runCommand(cmd);
  }

  return {
    subscribe,
    addCommands,
    runCommand,
    refreshStore,
  };
}

export const commandStore = createCommandStore();
