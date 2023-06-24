import { CoreProject } from "./CoreProject";
import logger from "../../utils/logger";
import type { UUID } from "../../../shared/utils/UniqueEntity";

// This should kinda be extending Registry and then called ProjectRegistry
// instead of Project Manager but I don't feel like the Registry interface is
// the correct fit for this.
export class ProjectManager {
  private _projects: { [id: string]: CoreProject } = {};

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
}
