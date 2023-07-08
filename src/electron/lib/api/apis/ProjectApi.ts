import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import type { UUID } from "../../../../shared/utils/UniqueEntity";
import type { SharedProject, LayoutPanel } from "../../../../shared/types/index";
import type { IpcResponse } from "../MainApi";

export class ProjectApi implements ElectronMainApi<ProjectApi> {
  constructor(private readonly blix: Blix) {}

  async createProject(): Promise<IpcResponse<SharedProject>> {
    const graphId = this.blix.graphManager.createGraph();
    const project = this.blix.projectManager.createProject();
    project.addGraph(graphId);
    this.blix.graphManager.onGraphUpdated(graphId);

    return {
      success: true,
      data: project.toSharedProject(),
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
    this.blix.projectManager.closeProject(uuid);
  }

  // async getOpenProjects(): Promise<FrontendProject[]> {
  //   logger.info("Retrieving open projects");
  //   return this._projMgr.getOpenProjects().map((proj) => proj.mapToFrontendProject());
  // }

  async updateLayout(id: UUID, layout: LayoutPanel) {
    this.blix.projectManager.updateLayout(id, layout);
  }
}
