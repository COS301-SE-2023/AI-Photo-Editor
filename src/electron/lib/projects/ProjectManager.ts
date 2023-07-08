import { CoreProject } from "./CoreProject";
import logger from "../../utils/logger";
import { join } from "path";
import { app } from "electron";
import fs from "fs";
import type { PathLike } from "fs";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { MainWindow } from "../api/apis/WindowApi";
import type { SharedProject, LayoutPanel } from "../../../shared/types";
import { dialog } from "electron";
import type { IpcResponse } from "../api/MainApi";

// This should kinda be extending Registry and then called ProjectRegistry
// instead of Project Manager but I don't feel like the Registry interface is
// the correct fit for this.
export class ProjectManager {
  private _path: string;
  private _projects: { [id: string]: CoreProject };
  private _mainWindow: MainWindow;

  constructor(mainWindow: MainWindow) {
    this._mainWindow = mainWindow;
    this._path = join(app.getPath("userData"), "projects");
    if (!fs.existsSync(this._path)) {
      fs.mkdirSync(this._path);
    }
    this._projects = {};
  }

  /**
   *	Creates a new CoreProject with the given name and a starter layout.
   *
   *	@param name The name of the project.
   *
   *	@returns The newly created project.
   */
  public createProject(name = "New Project"): CoreProject {
    const starterLayout: LayoutPanel = {
      panels: [
        // {
        //   panels: [
        //     {
        //       content: "media",
        //     },
        //     {
        //       content: "shortcutSettings",
        //     },
        //   ],
        // },
        {
          content: "debug",
        },
        {
          content: "graph",
        },
      ],
    };
    const project = new CoreProject(name, starterLayout);
    project.location = join(this._path, project.uuid);
    this._projects[project.uuid] = project;
    return project;
  }

  closeProject(uuid: UUID) {
    delete this._projects[uuid];
  }

  getOpenProjects() {
    return Object.values(this._projects);
  }

  renameProject(uuid: UUID, name: string) {
    if (this._projects.hasOwnProperty(uuid)) {
      return this._projects[uuid].rename(name);
    } else {
      return false;
    }
  }

  saveAllProjects() {
    for (const project in this._projects) {
      if (this._projects.hasOwnProperty(project)) {
        this.saveProject(project);
      }
    }
  }

  saveProject(id: UUID): IpcResponse<string> {
    const project = this._projects[id];
    if (!project) {
      return { success: false, data: "Project not found" };
    }
    // Save project to local disk
    const data = { name: project.name, uuid: project.uuid, layout: project.layout };
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    fs.writeFileSync(`${project.location}.blx`, JSON.stringify(data, null, 2));

    return { success: true, data: "Project saved" };
  }

  loadRecentProjects(): void {
    const projects = fs.readdirSync(this._path);
    if (!projects) {
      return;
    }
    const recentProjects: SharedProject[] = [];
    for (const project of projects) {
      if (project === ".DS_Store") continue; // Some File returned when using readdirSync on mac
      const data = JSON.parse(fs.readFileSync(join(this._path, project)).toString());
      // TODO:
      // At the moment we just create a project with the name, we dont actually load the graphs or layout
      const newProject: CoreProject = this.createProject(data.name as string);
      this._projects[newProject.uuid] = newProject;
      recentProjects.push(newProject.toSharedProject());
      fs.unlinkSync(join(this._path, project));
    }

    // console.log(this._mainWindow?.apis.clientProjectApi)
    this._mainWindow.apis.projectClientApi.loadProjects(recentProjects);
  }

  async loadProject(options: "openFile" | "openDirectory" | "multiSelections") {
    const result = await this.createDialogBox(options);
    if (!(result && !result.canceled && result.filePaths.length > 0)) return;

    const project = fs.readFileSync(result.filePaths[0]);
    if (!project) {
      return;
    }

    const data = JSON.parse(project.toString());

    if (!this.validateProjectFile(data)) return; // Some sort of error

    this._mainWindow.apis.projectClientApi.loadProject(
      this.createProject(data.name as string).toSharedProject()
    );
  }

  async createDialogBox(options: "openFile" | "openDirectory" | "multiSelections") {
    if (!this._mainWindow) return;
    return await dialog.showOpenDialog(this._mainWindow, {
      properties: [options],
      filters: [{ name: "Projects", extensions: ["blx"] }],
    });
  }

  async saveCurrentProject(schema: ProjectFile) {
    if (!this._mainWindow) return;
    const name = await dialog.showSaveDialog(this._mainWindow, {});
    const pathToProject = name.filePath as PathLike;
    // const project = this._projects[schema.id];
    // if (!project) return;

    // const data = { name: project.name, uuid: project.uuid, layout: schema.layout };
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    // fs.writeFileSync(pathToProject, JSON.stringify(data, null, 2));
    // console.log(JSON.stringify(data, null, 2))
  }

  async updateLayout(id: UUID, layout: LayoutPanel) {
    this._projects[id].layout = layout;
  }

  validateProjectFile(data: any): boolean {
    // if(!data.id || !data.name || !data.layout) return false;

    return true;
  }

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
      // TODO: Notify frontend of project change
      return true;
    }

    return false;
  }
}

interface ProjectFile {
  name: string;
  layout: LayoutPanel;
  graphs?: []; // TODO: Add graphs contained in project here
}
