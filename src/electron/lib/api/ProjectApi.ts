import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../Blix";
import type { Project as FrontendProject } from "../../../frontend/components/Projects/Project";
import logger from "../../utils/logger";
import type { UUID } from "../../utils/UniqueEntity";

export class ProjectApi implements ElectronMainApi<ProjectApi> {
  private readonly _projMgr;

  // @ts-ignore
  constructor(private readonly _blix: Blix) {
    this._projMgr = this._blix.projectManager;
  }

  async createProject(): Promise<FrontendProject> {
    logger.info("Creating new project");
    return this._projMgr.createProject().mapToFrontendProject();
  }

  async renameProject(projId: UUID) {
    logger.info("Renaming project");
  }

  async getOpenProjects(): Promise<FrontendProject[]> {
    logger.info("Retrieving open projects");
    return this._projMgr.getOpenProjects().map((proj) => proj.mapToFrontendProject());
  }
}
