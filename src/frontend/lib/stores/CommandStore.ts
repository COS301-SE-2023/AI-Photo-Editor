import { writable, get } from "svelte/store";
import { projectsStore } from "./ProjectStore";
import type { CommandResponse, ICommand } from "@shared/types";
import { focusedGraphStore, graphMall } from "./GraphStore";

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
    // window.apis.commandApi.addCommand(cmds);
  }

  async function runCommand(id: string, args?: Record<string, any>) {
    try {
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
    } catch (e) {
      return {
        status: "error",
        message: "Command not available",
      } satisfies CommandResponse;
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
    if (project) await projectsStore.handleProjectSaving(project.id);
    // if (project) {
    //   await Promise.all(
    //     project.graphs.map(async (graph) => await graphMall.getGraph(graph).updateUIPositions())
    //   );
    // }
    return {
      projectId: project?.id,
    };
  },
  "blix.projects.saveAs": async () => {
    const project = get(projectsStore).activeProject;
    // For every graph in the project, update the copy of the node positions in the backend
    if (project) await projectsStore.handleProjectSaving(project.id);
    // if (project) {
    //   await Promise.all(
    //     project.graphs.map(async (graph) => await graphMall.getGraph(graph).updateUIPositions())
    //   );
    // }
    return {
      projectId: project?.id,
    };
  },
  "blix.graphs.create": () => {
    const project = get(projectsStore).activeProject;
    return {
      projectId: project?.id,
    };
  },
  "blix.graphs.import": () => {
    const project = get(projectsStore).activeProject;
    return { projectId: project?.id };
  },
  "blix.graphs.export": () => {
    const graph = get(focusedGraphStore).graphUUID;

    return { graph };
  },
};

// ========== Frontend Commands ==========

// const commands =

export const commandStore = createCommandStore();
