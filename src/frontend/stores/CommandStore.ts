import { writable } from "svelte/store";

interface CommandStore {
  commands: string[];
}

function createCommandStore() {
  const { subscribe, set } = writable<CommandStore>({
    commands: [],
  });

  // Called when the command registry changes
  // Automatically updates the value of the store
  function refreshStore(results: string[]) {
    // console.log(`Registry changed; Got:\n${results}`);
    // TODO: Properly set the new store values
    set({ commands: results });
  }

  function addCommands(cmds: any[]) {
    // window.apis.pluginApi.addCommand(cmd);
  }

  async function runCommand(cmd: string) {
    await window.apis.pluginApi.runCommand();
  }

  return {
    subscribe,
    addCommands,
    runCommand,
    refreshStore,
  };
}

export const commandStore = createCommandStore();
