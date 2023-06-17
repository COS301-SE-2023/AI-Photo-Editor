import { CoreProject } from "./CoreProject";
import logger from "../../utils/logger";
import type { UUID } from "../../utils/UniqueEntity";

// This should kinda be extending Registry and then called ProjectRegistry
// instead of Project Manager but I don't feel like the Registry interface is
// the correct fit for this.
export class ProjectManager {
  private _projects: { [id: string]: CoreProject } = {};

  createProject(name = "New Project"): CoreProject {
    const project = new CoreProject(name);
    this._projects[project.uuid] = project;
    logger.info(`Created new project ${project.uuid}`);
    return project;
  }

  // closeProject(id: string) {}

  getOpenProjects() {
    return Object.values(this._projects);
  }

  // async renameProject(uuid: UUID) {}
}
