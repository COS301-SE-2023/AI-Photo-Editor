import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import type { UUID } from "../../../../shared/utils/UniqueEntity";
import type { CommonProject } from "../../../../shared/types/index";
import logger from "../../../utils/logger";
import { ClientProjectApi } from "@frontend/lib/api/ClientProjectApi";
import type { IpcResponse } from "../MainApi";

// Exposes project data for currently loaded projects
export class ProjectApi implements ElectronMainApi<ProjectApi> {
  private readonly _projMgr;

  // @ts-ignore
  constructor(private readonly _blix: Blix) {
    this._projMgr = this._blix.projectManager;
  }

  // ========================================
  // 2 way communication
  // ========================================

  async createProject(): Promise<IpcResponse<CommonProject>> {
    return {
      success: true,
      data: this._projMgr.createProject().mapToCommonProject(),
    };
  }

  async renameProject(uuid: UUID, name: string): Promise<IpcResponse<string>> {
    if (this._projMgr.renameProject(uuid, name)) {
      return {
        success: true,
        data: "Project renamed successfully.",
      };
    } else {
      return {
        success: false,
        data: "Project renamed failed.",
      };
    }
  }

  async getRecentProjects(): Promise<IpcResponse<CommonProject[]>> {
    const projects: CommonProject[] = this._projMgr.getRecentProjects().data;
    return {
      success: true,
      data: projects ? projects : [],
    };
  }

  // ========================================
  // 1 way communication
  // ========================================

  async closeProject(uuid: UUID) {
    this._projMgr.closeProject(uuid);
  }

  // async getOpenProjects(): Promise<FrontendProject[]> {
  //   logger.info("Retrieving open projects");
  //   return this._projMgr.getOpenProjects().map((proj) => proj.mapToFrontendProject());
  // }
}
