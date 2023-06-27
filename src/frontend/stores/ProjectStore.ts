import { writable, get } from "svelte/store";
import { Project } from "../components/Projects/Project";
import type { UUID } from "../../shared/utils/UniqueEntity";
import type { CommonProject } from "@shared/types";

interface ProjectManagerState {
  projectStores: NewProjectStore[];
  activeProject: UUID;
}

function createNewProjectStore(project: CommonProject) {
  const { subscribe, update, set } = writable<Project>(new Project(project.name, project.uuid));
  const uuid = project.uuid;

  function getId() {
    return uuid;
  }

  return {
    subscribe,
    update,
    set,
    getId,
  };
}

export type NewProjectStore = ReturnType<typeof createNewProjectStore>;

function createProjectManager() {
  const store = writable<ProjectManagerState>({
    projectStores: [],
    activeProject: "",
  });

  async function createProject() {
    const res = await window.apis.projectApi.createProject();
    store.update((state) => ({
      ...state,
      projectStores: [...state.projectStores, createNewProjectStore(res.data)],
      activeProject: res.data.uuid,
    }));
  }

  function loadProject(project: CommonProject) {
    store.update((state) => ({
      ...state,
      projectStores: [...state.projectStores, createNewProjectStore(project)],
      activeProject: project.uuid,
    }));
  }

  async function closeProject(uuid: UUID) {
    store.update((state) => {
      const activeProject =
        state.activeProject === uuid
          ? getNextActiveProject(state.projectStores, state.activeProject)
          : state.activeProject;
      const projectStores = state.projectStores.filter((p) => p.getId() !== uuid);
      return { ...state, projectStores, activeProject };
    });

    await window.apis.projectApi.closeProject(uuid);
  }

  function getNextActiveProject(projects: NewProjectStore[], activeProject: UUID): UUID {
    const currentIndex = projects.findIndex((p) => p.getId() === activeProject);
    const nextIndex = currentIndex === projects.length - 1 ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0) {
      return "";
    } else {
      return projects[nextIndex].getId();
    }
  }

  function setActiveProject(uuid: UUID) {
    store.update((state) => {
      const project = state.projectStores.find((p) => p.getId() === uuid);
      if (!project) {
        return state;
      } else {
        return { ...state, activeProject: uuid };
      }
    });
  }

  function getActiveProject(): NewProjectStore {
    const storeState = get(store);
    const project = storeState.projectStores.find((p) => p.getId() === storeState.activeProject);
    return project!;
  }

  function updateProject(state: CommonProject) {
    // Passes in the state of the backend project which changed. I would assume
    // we'll have to update the correct project store with the new data. The
    // project store and manager kinda a bit cooked iono. So, I guess whoever
    // works on this will have to feel around to get it working or it will have
    // to be changed later
  }

  // TODO: Rewrite from old code
  // async function renameProject(uuid: UUID, name: string) {
  //   update((state) => {
  //     const index = state.projects.findIndex((p) => p.uuid === uuid);

  //     if (index === 1) {
  //       return state;
  //     }

  //     state.projects[index].name = name;

  //     return { ...state };
  //   });
  //   await window.apis.projectApi.renameProject(uuid, name);
  // }

  return {
    subscribe: store.subscribe,
    createProject,
    loadProject,
    closeProject,
    setActiveProject,
    getActiveProject,
    updateProject,
  };
}

export type ProjectManagerStore = ReturnType<typeof createProjectManager>;
export const projectManager: ProjectManagerStore = createProjectManager();

// Struggling a bit to add write types for custom stores
interface ProjectStoreState {
  projects: Project[];
  activeProject: Project | null;
  project?: Project;
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
