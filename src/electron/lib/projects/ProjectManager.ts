import { CoreProject } from "./CoreProject";
import logger from "../../utils/logger";
import type { IpcResponse } from "../api/IpcResponse";
import { join } from "path";
import { app } from "electron";
import fs from "fs";
import { UUID } from "../../../shared/utils/UniqueEntity";

// This should kinda be extending Registry and then called ProjectRegistry
// instead of Project Manager but I don't feel like the Registry interface is
// the correct fit for this.
export class ProjectManager {
  private path: string;
  private _projects: { [id: string]: CoreProject };

  constructor() {
    this.path = join(app.getPath("userData"), "projects");
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path);
    }
    this._projects = {};
  }

  createProject(name = "New Project"): CoreProject {
    const project = new CoreProject(name);
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
  saveProject(id: UUID): IpcResponse<string> {
    const project = this._projects[id];
    if (!project) {
      return { success: false, data: "Project not found" };
    }

    // Save project to local disk
    const data = { name: project.name, uuid: project.uuid };
    fs.writeFileSync(
      join(this.path, `Project${project.uuid.slice(0, 6)}.json`),
      JSON.stringify(data, null, 2)
    );

    return { success: true, data: "Project saved" };
  }

  loadProject(projectName: string): IpcResponse<string> {
    const project = fs.readFileSync(join(this.path, projectName));
    if (!project) {
      return { success: false, data: "Project not found" };
    }

    const data = JSON.parse(project.toString());
    this.createProject(data.name as string);
    return { success: true, data: "Project loaded" };
  }

  // async renameProject(uuid: UUID) {}
}
