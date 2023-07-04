import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import type { UUID } from "../../../../shared/utils/UniqueEntity";
import type { CommonProject } from "../../../../shared/types/index";
import type { IpcResponse } from "../MainApi";

export class ProjectApi implements ElectronMainApi<ProjectApi> {
  constructor(private readonly _blix: Blix) {}

  async createProject(): Promise<IpcResponse<CommonProject>> {
    return {
      success: true,
      data: this._blix.projectManager.createProject().mapToCommonProject(),
    };
  }

  async renameProject(uuid: UUID, name: string): Promise<IpcResponse<string>> {
    if (this._blix.projectManager.renameProject(uuid, name)) {
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

  // async getRecentProjects(): Promise<IpcResponse<CommonProject[]>> {
  //   const projects: CommonProject[] = this._projMgr.getRecentProjects().data;
  //   return {
  //     success: true,
  //     data: projects ? projects : [],
  //   };
  // }

  async closeProject(uuid: UUID) {
    this._blix.projectManager.closeProject(uuid);
  }

  // async getOpenProjects(): Promise<FrontendProject[]> {
  //   logger.info("Retrieving open projects");
  //   return this._projMgr.getOpenProjects().map((proj) => proj.mapToFrontendProject());
  // }
}
