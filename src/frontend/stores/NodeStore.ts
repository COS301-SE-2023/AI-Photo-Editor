import { writable } from "svelte/store";
import type { INode } from "../../shared/types/index";

interface NodeStore {
  nodes: INode[];
}

function createNodeStore() {
  const { subscribe, set } = writable<NodeStore>({
    nodes: [],
  });

  // Called when the command registry changes
  // Automatically updates the value of the store
  function refreshStore(results: INode[]) {
    set({ nodes: results });
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

export const nodeStore = createNodeStore();
