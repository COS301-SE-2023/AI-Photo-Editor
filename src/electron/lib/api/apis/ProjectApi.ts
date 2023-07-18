import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import type { UUID } from "../../../../shared/utils/UniqueEntity";
import type { SharedProject, LayoutPanel } from "../../../../shared/types/index";
import type { IpcResponse } from "../MainApi";

export class ProjectApi implements ElectronMainApi<ProjectApi> {
  constructor(private readonly blix: Blix) {}

  async createProject(): Promise<IpcResponse<string>> {
    const project = this.blix.projectManager.createProject();
    const graphId = this.blix.graphManager.createGraph();
    this.blix.projectManager.addGraph(project.uuid, graphId);
    this.blix.graphManager.onGraphUpdated(graphId);

    return {
      success: true,
      data: "Project created successfully",
    };
  }

  async renameProject(uuid: UUID, name: string): Promise<IpcResponse<string>> {
    if (this.blix.projectManager.renameProject(uuid, name)) {
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
    this.blix.projectManager.removeProject(uuid);
  }
}
