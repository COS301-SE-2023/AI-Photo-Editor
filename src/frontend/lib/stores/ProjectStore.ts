import { writable, derived, type Readable, get } from "svelte/store";
import { type UUID } from "@shared/utils/UniqueEntity";
import { Project } from "../Project";

type ProjectsStoreState = {
  projects: Project[];
  activeProject: Project | null;
};

/**
 * TODO: Still a bit conflicted about this store. Biggest issue that if I change
 * the store so that it stores individual project stores then the ProjectsStore
 * will not be notified if the state of the individual project stores get
 * changed somewhere else in the app. I see two options to fix this issue:
 *
 * 1. Create writable ProjectStore but only expose the subscribe method to the
 * outside world to almost make it readable. Then force update of these
 * stores through the ProjectsStore.
 *
 * 2. Create some sort of proxy store so that only part of the state can be
 * subscribed to. This probably not going to be so easy.
 *
 * 3. Just leave the current implementation as is. The derived project store
 * subscribers will get notified every time the ProjectStore updates.
 */
class ProjectsStore {
  private readonly store = writable<ProjectsStoreState>({
    projects: [],
    activeProject: null,
  });

  /**
   * Adds a project to the store. Use when project is opened in the backend
   * and UI has to reflect the new state.
   */
  public addProject(project: Project): void {
    this.store.update((state) => {
      state.projects.push(project);
      if (!state.activeProject) {
        state.activeProject = project;
      }
      return state;
    });
  }

  /**
   * Adds a list of projects to the store. Use when projects are opened in the
   * backend and UI has to reflect the new state.
   */
  public addProjects(projects: Project[]): void {
    if (projects.length) {
      this.store.update((state) => {
        state.projects.push(...projects);
        if (!state.activeProject) {
          state.activeProject = projects[0];
        }
        return state;
      });
    }
  }

  /**
   * Creates a new project in the backend and adds it to the store.
   */
  public async createProject(): Promise<void> {
    const res = await window.apis.projectApi.createProject();

    if (res.success) {
      const data = res.data;
      const project = new Project(data.name, data.uuid);
      this.addProject(project);
      this.setActiveProject(project.id);
    }
  }

  /**
   * Removes a projects to the store. Use when projected is closed in the
   * backend and UI has to reflect the new state.
   *
   * @param id ID of specific Project
   */
  public removeProject(id: UUID): void {
    this.store.update((state) => {
      state.activeProject =
        state.activeProject?.id === id
          ? this.getNextActiveProject(state.projects, state.activeProject)
          : state.activeProject;
      state.projects = state.projects.filter((p) => p.id !== id);
      return state;
    });
  }

  /**
   * Closes an open project in the backend and removes it from the the store.
   *
   * @param id ID of specific Project
   */
  public async closeProject(id: UUID): Promise<void> {
    this.removeProject(id);
    await window.apis.projectApi.closeProject(id);
  }

  /**
   * Changes the current active project to be reflected on the UI.
   *
   * @param id ID of specific Project
   */
  public setActiveProject(id: UUID) {
    const storeValue = get(this.store);

    if (storeValue.activeProject?.id !== id) {
      this.store.update((state) => {
        state.activeProject = state.projects.find((p) => p.id === id) || null;
        return state;
      });
    }
  }

  /**
   * @param newState
   */
  public updateProject(newState: Project) {
    // TODO: This method is supposed to take the new state of a project
    // which might have been changed by the backend or frontend it should
    // then update the project. So, the parameter might have to change from
    // a Project to a CommonProject. Data flow will also have to be thought
    // about, because assume we changed the name of Project on the UI then
    // it should update in the store optimistically but then it should also
    // update the name in the backend. But then then backend should not send
    // an event to the store to be updated cause it kinda was already just
    // updated optimistically.
  }

  public changeName(newName: string, id: UUID) {
    this.store.update((state) => {
      const project = state.projects.find((p) => p.id === id);
      if (project) {
        project.name = newName;
      }
      return state;
    });
  }

  /**
   * DISCLAIMER: At the moment this actually does not return an independent
   * readable store. If some data is changed in this main store then all the
   * derived stores will be notified as well even if their state did not
   * necessarily change.
   *
   *
   * Returns a readable **Project** store which was derived from the
   * **ProjectsStore**. This store can be used independently and will not be
   * notified if the **ProjectsStore** is updated. A notification will only be
   * sent if the state of a specific project is updated.
   *
   * @param id ID of specific Project
   * @returns Derived readable ProjectStore
   */
  public getProjectStore(id: UUID): Readable<Project | null> {
    return derived(this.store, ($store) => {
      return $store.projects.find((p) => p.id === id) || null;
    });
  }

  public get subscribe() {
    return this.store.subscribe;
  }

  private getNextActiveProject(projects: Project[], currentProject: Project | null): Project {
    const currentIndex = projects.findIndex((p) => p.id === currentProject?.id);
    const nextIndex = currentIndex === projects.length - 1 ? currentIndex - 1 : currentIndex + 1;
    return projects[nextIndex] || null;
  }
}

export const projectsStore = new ProjectsStore();
