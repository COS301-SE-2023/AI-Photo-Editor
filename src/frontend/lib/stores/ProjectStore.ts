import type { SharedProject } from "@shared/types";
import type { GraphUUID } from "@shared/ui/UIGraph";
import { type UUID } from "@shared/utils/UniqueEntity";
import { derived, get, writable, type Readable } from "svelte/store";
import { constructLayout, layoutTemplate, type UIProject } from "../Project";
import { graphMall } from "./GraphStore";
import { cacheStore } from "./CacheStore";
import { mediaStore } from "./MediaStore";
import { type CacheUUID, type CacheMetadata } from "@shared/types/cache";

type ProjectsStoreState = {
  projects: UIProject[];
  activeProject: UIProject | null;
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
   * Adds a project to the store. Use when project is created in the backend
   * and UI has show the new state.
   */
  public handleProjectCreated(projectState: SharedProject, setAsActive = false): void {
    const { id, name, saved, layout, graphs, cache, mediaOutputIds } = projectState;

    const project: UIProject = {
      id,
      name: name ?? "Untitled",
      saved: saved ?? false,
      layout: layout ? constructLayout(layout) : constructLayout(layoutTemplate),
      graphs: graphs ? graphs : [],
      focusedGraph: writable<GraphUUID>(""),
      focusedPanel: writable<string>(""),
      cache: cache ? cache : [],
      mediaOutputIds: mediaOutputIds ? mediaOutputIds : [],
    };

    this.store.update((state) => {
      state.projects.push(project);
      if (!state.activeProject || setAsActive) {
        state.activeProject = project;
      }
      return state;
    });
  }

  /**
   * Updates the frontend project store whenever a change to a project has been
   * somewhere else in the system.
   *
   * @param changeState Object containing changed project state
   */
  public handleProjectChanged(changedState: SharedProject): void {
    this.store.update((state) => {
      const index = state.projects.findIndex((p) => p.id === changedState.id);

      if (index < 0) return state;

      const project = state.projects[index];
      const { id, name, saved, layout, graphs, cache, mediaOutputIds } = changedState;
      const newProject: UIProject = {
        id,
        name: name ? name : project.name,
        saved: saved ?? project.saved,
        layout: layout ? constructLayout(layout) : project.layout,
        graphs: graphs ? graphs : project.graphs,
        focusedGraph: project.focusedGraph,
        focusedPanel: project.focusedPanel,
        cache: cache ?? project.cache,
        mediaOutputIds: mediaOutputIds ?? project.mediaOutputIds,
      };
      state.projects[index] = newProject;

      if (state.activeProject?.id === newProject.id) {
        state.activeProject = newProject;
      }

      return state;
    });
  }

  /**
   * Removes a project from the store. Use when project is closed in the
   * backend and UI has to reflect the new state.
   *
   * @param id ID of specific Project
   */
  public handleProjectRemoved(projectId: UUID): void {
    this.store.update((state) => {
      state.activeProject =
        state.activeProject?.id === projectId
          ? this.getNextActiveProject(state.projects, state.activeProject)
          : state.activeProject;
      state.projects = state.projects.filter((p) => p.id !== projectId);
      return state;
    });
  }

  /**
   * Creates a new project in the backend.
   */
  public async createProject(): Promise<void> {
    await window.apis.projectApi.createProject();
  }

  /**
   * Closes an open project in the backend and removes it from the the store.
   *
   * @param id ID of specific Project
   */
  public async closeProject(projectId: UUID): Promise<void> {
    const project = get(this.store).projects.find((p) => p.id === projectId);
    await window.apis.projectApi.closeProject(projectId, project?.graphs);
  }

  /**
   * Changes the current active project to be reflected on the UI.
   *
   * @param id ID of specific Project
   */
  public setActiveProject(projectId: UUID) {
    const storeValue = get(this.store);
    if (storeValue.activeProject?.id !== projectId) {
      this.store.update((state) => {
        state.activeProject = state.projects.find((p) => p.id === projectId) || null;
        return state;
      });
    }
  }

  public getActiveProjectId(): UUID | null {
    return get(this.store).activeProject?.id || null;
  }

  public async handleProjectSaving(projectId: UUID) {
    const project = get(this.store).projects.find((p) => p.id === projectId);
    if (!project) return;
    // Update Ui Positions
    await Promise.all(
      project.graphs.map(async (graph) => await graphMall.getGraph(graph).updateUIPositions())
    );
    // Update Project Layout
    await window.apis.projectApi.saveLayout(projectId, project.layout.saveLayout());
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
  public getProjectStore(id: UUID): Readable<UIProject | null> {
    return derived(this.store, ($store) => {
      return $store.projects.find((p) => p.id === id) || null;
    });
  }

  public getReactiveActiveProjectGraphIds(): Readable<string[]> {
    return derived(this.store, ($store) => {
      return $store.activeProject?.graphs || [];
    });
  }

  public getReactiveProjectCacheMap(projectId: UUID): Readable<Map<CacheUUID, CacheMetadata>> {
    return derived([this.store, cacheStore], ([$projectStore, $cacheStore]) => {
      const cacheIds = $projectStore.projects.find((p) => p.id === projectId)?.cache || [];
      const cacheObjects = new Map<CacheUUID, CacheMetadata>();

      cacheIds.forEach((id) => {
        const cacheMetadata = $cacheStore[id];

        if (cacheMetadata) {
          cacheObjects.set(id, cacheMetadata);
        }
      });

      return cacheObjects;
    });
  }

  public getReactiveActiveProjectCacheIds(): Readable<string[]> {
    return derived(this.store, ($store) => {
      return $store.activeProject?.cache || [];
    });
  }

  public get subscribe() {
    return this.store.subscribe;
  }

  private getNextActiveProject(projects: UIProject[], currentProject: UIProject | null): UIProject {
    const currentIndex = projects.findIndex((p) => p.id === currentProject?.id);
    const nextIndex = currentIndex === projects.length - 1 ? currentIndex - 1 : currentIndex + 1;
    return projects[nextIndex] || null;
  }

  public get activeProjectGraphIds() {
    return derived(this.store, ($store) => {
      return $store.activeProject?.graphs || [];
    });
  }
}

export const projectsStore = new ProjectsStore();
