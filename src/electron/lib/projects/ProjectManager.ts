import { CoreProject } from "./CoreProject";
import logger from "../../utils/logger";
import { join } from "path";
import { app } from "electron";
import type { PathLike } from "fs";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { MainWindow } from "../api/apis/WindowApi";
import { readFile } from "fs/promises";
import { z } from "zod";
import { dialog } from "electron";
import type { LayoutPanel } from "../../../shared/types/index";
import { saveProjectCommand } from "./ProjectCommands";
import { Blix } from "../Blix";
import { IpcResponse } from "../../lib/api/MainApi";

export class ProjectManager {
  private _projects: { [id: string]: CoreProject };
  private _mainWindow: MainWindow;
  private _projectsCreatedCounter: number;

  constructor(mainWindow: MainWindow) {
    this._mainWindow = mainWindow;
    this._projects = {};
    this._projectsCreatedCounter = 1;
  }

  /**
   *	Creates a new CoreProject with the given name and a starter layout.
   *
   *	@param name The name of the project.
   *
   *	@returns The newly created project.
   */
  public createProject(name = `Untitled-${this._projectsCreatedCounter++}`): CoreProject {
    const project = new CoreProject(name);
    this._projects[project.uuid] = project;
    this.onProjectCreated(project.uuid);
    return project;
  }

  /**
   * This function will load a project that is stored on a user's device.
   *
   * @param fileName Project name derived from file name
   * @param fileContent Project file content
   * @param path Path to project file
   * @returns UUID of new CoreProject
   */
  public loadProject(fileName: string, path: PathLike): UUID {
    const project = new CoreProject(fileName);
    project.location = path;
    this._projects[project.uuid] = project;
    this.onProjectCreated(project.uuid);
    return project.uuid;
  }

  public getProject(id: UUID): CoreProject | null {
    return this._projects[id];
  }

  public async removeProject(blix: Blix, uuid: UUID, forceRemove = false) {
    const project = this._projects[uuid];
    if (!project) forceRemove = true; // Project does not exist, just obliterate the tab
    let remove = true;
    let output = -1;
    let res;
    // console.log(forceRemove)
    if (!project.saved && !forceRemove) {
      res = await this.projectClosingMenu(project.name);
      // Apis calls to frontend cant be async? await has no effect
      if (res === 0) {
        /**
         * Save changes to project
         */
        // Potential async problems ?
        this._mainWindow.apis.projectClientApi.handleProjectSaving(uuid);

        const response = await saveProjectCommand.handler(blix, {
          projectId: project.uuid,
          projectPath: project.location,
        });
        if (response.status === "error") remove = false;
        output = res;
      } else if (res === 1) {
        /**
         * User cancelled
         */
        remove = false;
        output = res;
      }
    }
    if (remove) {
      /**
       * After Save
       * After Discard Changes
       */
      delete this._projects[uuid];
      this.onProjectRemoved(uuid);
    }

    if (Object.keys(this._projects).length === 0) this._projectsCreatedCounter = 1;
    return output;
  }

  public async projectClosingMenu(project: string): Promise<number> {
    return await dialog
      .showMessageBox(this._mainWindow, {
        type: "info",
        buttons: ["Save Changes...", "Cancel", "Discard Changes"],
        cancelId: 1,
        message: `${project} currently has unsaved changes.`,
        detail: `If you dont save the project, unsaved changes will be lost.`,
      })
      .then(({ response }) => {
        return response;
      });
  }

  public getOpenProjects() {
    return Object.values(this._projects);
  }

  public getTotalUnsavedProjects() {
    return Object.values(this._projects)
      .filter((project) => !project.saved)
      .map((project) => ({ projectName: project.name, projectId: project.uuid }));
  }

  public async saveProjectLayout(projectId: UUID, layout: LayoutPanel) {
    this._projects[projectId].layout = layout;
  }

  public renameProject(uuid: UUID, name: string): boolean {
    if (this._projects.hasOwnProperty(uuid)) {
      return this._projects[uuid].rename(name);
    } else {
      return false;
    }
  }

  // public async getRecentProjectsList(): Promise<RecentProject[]> {
  //   try {
  //     const filePath = join(app.getPath("userData"), "recentProjects.json");
  //     const contents = await readFile(filePath, "utf8");
  //     return recentProjectsSchema.parse(JSON.parse(contents)).projects;
  //   } catch (err) {
  //     logger.error("Could not retrieve recent project list");
  //     return [];
  //   }
  // }

  public onProjectCreated(projectId: UUID) {
    const project = this._projects[projectId];
    if (!project) return;
    this._mainWindow.apis.projectClientApi.onProjectCreated(project.toSharedProject());
  }

  public onProjectChanged(projectId: UUID) {
    const project = this._projects[projectId];
    if (!project) return;
    this._mainWindow.apis.projectClientApi.onProjectChanged(project.toSharedProject());
  }

  public onProjectRemoved(projectId: UUID) {
    this._mainWindow.apis.projectClientApi.onProjectRemoved(projectId);
  }

  // validateProjectFile(data: any): boolean {
  //   // if(!data.id || !data.name || !data.layout) return false;
  //   return true;
  // }

  /**
   * Adds a graph to a project.
   *
   * @param projectId - The UUID of the project to add the graph to.
   * @param graphId - The UUID of the graph to add.
   */
  public addGraph(projectId: UUID, graphId: UUID): boolean {
    const project = this._projects[projectId];

    if (project) {
      project.addGraph(graphId);
      this.onProjectChanged(project.uuid);
      return true;
    }

    return false;
  }

  public removeGraph(graphId: UUID) {
    for (const project of Object.values(this._projects)) {
      if (project.removeGraph(graphId)) {
        this.onProjectChanged(project.uuid);
      }
    }
  }

  public getRelatedProject(graphUUID: UUID) {
    return Object.values(this._projects).filter((project) => project.graphs.includes(graphUUID))[0];
  }

  public setProjectSaveState(projectId: UUID, newState: boolean) {
    this._projects[projectId].saved = newState;
    this.onProjectChanged(projectId);
  }

  public addCacheObjects(projectUUID: UUID, cacheUUIDs: UUID[]): IpcResponse<string> {
    const res = this._projects[projectUUID].addCacheObjects(cacheUUIDs);
    this.onProjectChanged(projectUUID);
    return res;
  }

  public removeCacheObjects(projectUUID: UUID, cacheUUIDs: UUID[]): IpcResponse<string> {
    const res = this._projects[projectUUID].removeCacheObjects(cacheUUIDs);
    this.onProjectChanged(projectUUID);
    return res;
  }
}

const recentProjectsSchema = z.object({
  projects: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      date: z.string().datetime(),
    })
  ),
});

type RecentProject = z.infer<typeof recentProjectsSchema>["projects"][number];
