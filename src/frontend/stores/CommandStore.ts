import { writable } from "svelte/store";

function createCommandStore() {
  const { subscribe, set } = writable([]);

  let ipcConnected = false;

  function tryConnectIPC() {
    if (ipcConnected) return;

    // TODO: Set up Typescript to properly identify window.api
    // See: [https://stackoverflow.com/a/71078436]
    if ("api" in window && window.api.commandRegistry) {
      // @ts-ignore:
      window.api.commandRegistry("registryChanged", null, refreshStore);
      ipcConnected = true;
    }
  }

  // Called when the command registry changes
  // Automatically updates the value of the store
  function refreshStore(results: any) {
    tryConnectIPC();

    // console.log(`Registry changed; Got:\n${results}`);
    // TODO: Properly set the new store values
    set([]);
  }

  function addCommands(cmds: any[]) {
    // TODO: Type the parameters & Implement
  }

  function runCommand(cmd: string) {
    return;
  }

  return {
    subscribe,
    addCommands,
    runCommand,
  };
}

export const commandStore = createCommandStore();
