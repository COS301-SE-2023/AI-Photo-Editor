import { writable } from "svelte/store";
import { Project } from "../components/Projects/Project";
import type { UUID } from "../../shared/utils/UniqueEntity";

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
    const res = await window.apis.projectApi.createProject();
    const project = new Project(res.data.name, res.data.uuid);
    update((state) => ({
      ...state,
      projects: [...state.projects, project],
      activeProject: project,
    }));
  }

  async function closeProject(uuid: UUID) {
    update((state) => {
      const activeProject =
        state.activeProject?.uuid === uuid
          ? getNextActiveProject(state.projects, state.activeProject)
          : state.activeProject;
      const projects = state.projects.filter((p) => p.uuid !== uuid);
      return { ...state, projects, activeProject };
    });

    await window.apis.projectApi.closeProject(uuid);
  }

  async function renameProject(uuid: UUID, name: string) {
    update((state) => {
      const index = state.projects.findIndex((p) => p.uuid === uuid);

      if (index === 1) {
        return state;
      }

      state.projects[index].name = name;

      return { ...state };
    });
    await window.apis.projectApi.renameProject(uuid, name);
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
    closeProject,
    createProject,
    renameProject,
    setActiveProject,
  };
}

export const projectStore: ProjectStore = createProjectStore();
