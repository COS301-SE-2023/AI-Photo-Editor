import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import type { UUID } from "../../../../shared/utils/UniqueEntity";
import type { IpcResponse } from "../MainApi";
import type { LayoutPanel } from "../../../../shared/types/index";
import {
  CoreGraphUpdateEvent,
  CoreGraphUpdateParticipant,
} from "../../core-graph/CoreGraphInteractors";

export class ProjectApi implements ElectronMainApi<ProjectApi> {
  constructor(private readonly blix: Blix) {}

  async createProject(): Promise<IpcResponse<string>> {
    const project = this.blix.projectManager.createProject();

    for (let i = 0; i < 1; i++) {
      const graphId = this.blix.graphManager.createGraph();
      this.blix.graphManager.onGraphUpdated(
        graphId,
        new Set([CoreGraphUpdateEvent.graphUpdated]),
        CoreGraphUpdateParticipant.system
      );
      this.blix.projectManager.addGraph(project.uuid, graphId);
    }

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

  async saveLayout(projectId: UUID, layout: LayoutPanel) {
    this.blix.projectManager.saveProjectLayout(projectId, layout);
  }

  // async getRecentProjects(): Promise<IpcResponse<CommonProject[]>> {
  //   const projects: CommonProject[] = this._projMgr.getRecentProjects().data;
  //   return {
  //     success: true,
  //     data: projects ? projects : [],
  //   };
  // }

  async closeProject(uuid: UUID, graphs?: UUID[]) {
    const res = await this.blix.projectManager.removeProject(this.blix, uuid);
    if (res === -1 && graphs) this.blix.graphManager.deleteGraphs(graphs);
  }

  async addCacheObjects(projectUUID: UUID, cacheUUIDs: UUID[]) {
    this.blix.projectManager.addCacheObjects(projectUUID, cacheUUIDs);
  }

  async removeCacheObjects(projectUUID: UUID, cacheUUIDs: UUID[]) {
    this.blix.projectManager.removeCacheObjects(projectUUID, cacheUUIDs);
  }
}
