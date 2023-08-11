import { writable, get } from "svelte/store";
import { projectsStore } from "./ProjectStore";
import type { ICommand } from "@shared/types";
import { graphMall } from "./GraphStore";

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

  async function runCommand(id: string, args?: Record<string, any>) {
    if (id in blixCommandParams) {
      if (args) {
        return await window.apis.commandApi.runCommand(id, args);
      } else {
        return await window.apis.commandApi.runCommand(id, await blixCommandParams[id]());
      }
    } else {
      if (args) {
        return await window.apis.commandApi.runCommand(id, args);
      } else {
        return await window.apis.commandApi.runCommand(id);
      }
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
  "blix.projects.save": async () => {
    const project = get(projectsStore).activeProject;
    // For every graph in the project, update the copy of the node positions in the backend
    if (project) {
      await Promise.all(
        project.graphs.map(async (graph) => await graphMall.getGraph(graph).updateUIPositions())
      );
    }
    return {
      projectId: project?.id,
      layout: project?.layout.saveLayout(),
    };
  },
  "blix.projects.saveAs": async () => {
    const project = get(projectsStore).activeProject;
    // For every graph in the project, update the copy of the node positions in the backend
    if (project) {
      await Promise.all(
        project.graphs.map(async (graph) => await graphMall.getGraph(graph).updateUIPositions())
      );
    }
    return {
      projectId: project?.id,
      layout: project?.layout.saveLayout(),
    };
  },
  "blix.graphs.create": () => {
    const project = get(projectsStore).activeProject;
    return {
      projectId: project?.id,
    };
  },
};

export const commandStore = createCommandStore();
