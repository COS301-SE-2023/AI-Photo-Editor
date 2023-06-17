import { writable } from "svelte/store";
import type { Project } from "../components/Projects/Project";
import type { UUID } from "../../electron/utils/UniqueEntity";

// Struggling a bit to add write types for custom stores
interface ProjectStoreState {
  projects: Project[];
  activeProject: Project | null;
}

export type ProjectStore = ReturnType<typeof createProjectStore>;

function createProjectStore() {
  const { subscribe, update } = writable<ProjectStoreState>({
    projects: [],
    activeProject: null,
  });

  async function createProject() {
    const project = await window.apis.projectApi.createProject();
    update((state) => ({ ...state, projects: [...state.projects, project] }));
  }

  function removeProject(uuid: UUID) {
    update((state) => {
      const activeProject =
        state.activeProject?.uuid === uuid
          ? getNextActiveProject(state.projects, state.activeProject)
          : state.activeProject;
      const projects = state.projects.filter((p) => p.uuid !== uuid);
      return { ...state, projects, activeProject };
    });
  }

  function getNextActiveProject(projects: Project[], currentProject: Project | null) {
    const currentIndex = projects.findIndex((p) => p.uuid === currentProject?.uuid);
    const nextIndex = currentIndex === projects.length - 1 ? currentIndex - 1 : currentIndex + 1;
    return projects[nextIndex] || null;
  }

  function setActiveProject(id: string) {
    update((state) => {
      const project = state.projects.find((p) => p.uuid === id);
      return { ...state, activeProject: project || null };
    });
  }

  return {
    subscribe,
    removeProject,
    createProject,
    setActiveProject,
  };
}

export const projectStore: ProjectStore = createProjectStore();
