import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { Project } from "../components/Projects/Project";

// Struggling a bit to add write types for custom stores
// Also not sure where the best place is to define these types
// Should they just be defined at the top of store files?
// Or should they maybe be defined in the types directory to organize things a bit better?
interface ProjectStore {
  projects: Project[];
  activeProject: Project | null;
}

interface CustomProjectStore extends Writable<ProjectStore> {
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setActiveProject: (id: string) => void;
}

function createProjectStore(): CustomProjectStore {
  const { subscribe, set, update } = writable<ProjectStore>({
    projects: [],
    activeProject: null,
  });

  function addProject(project: Project) {
    update((state) => ({ ...state, projects: [...state.projects, project] }));
  }

  function removeProject(id: string) {
    update((state) => {
      const activeProject =
        state.activeProject?.id === id
          ? getNextActiveProject(state.projects, state.activeProject)
          : state.activeProject;
      const projects = state.projects.filter((p) => p.id !== id);
      return { ...state, projects, activeProject };
    });
  }

  function getNextActiveProject(projects: Project[], currentProject: Project | null) {
    const currentIndex = projects.findIndex((p) => p.id === currentProject?.id);
    const nextIndex = currentIndex === projects.length - 1 ? currentIndex - 1 : currentIndex + 1;
    return projects[nextIndex] || null;
  }

  function setActiveProject(id: string) {
    update((state) => {
      const project = state.projects.find((p) => p.id === id);
      return { ...state, activeProject: project || null };
    });
  }

  return {
    subscribe,
    set,
    update,
    addProject,
    removeProject,
    setActiveProject,
  };

  // return derived<ProjectStore, {projects: ProjectStore['projects'], activeProject: ProjectStore['activeProject']}>(projectStore, $projectStore => ({
  // 	get projects() {
  // 		return $projectStore.projects;
  // 	},
  // 	get activeProject() {
  // 		return $projectStore.projects;
  // 	}
  // }));
}

export const projectStore = createProjectStore();
