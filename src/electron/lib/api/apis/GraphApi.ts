import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { type UUID } from "../../../../shared/utils/UniqueEntity";
import { IPCGraphSubscriber } from "../../core-graph/CoreGraphInteractors";
import { UIGraph } from "@shared/ui/UIGraph";
import { NodeInstance } from "../../registries/ToolboxRegistry";

// Graphs across projects are stored homogeneously and referenced by UUID
export class GraphApi implements ElectronMainApi<GraphApi> {
  private readonly _blix: Blix;
  private readonly graphSubscriber: IPCGraphSubscriber;

  constructor(blix: Blix) {
    this._blix = blix;
    this.graphSubscriber = new IPCGraphSubscriber();

    // Add IPC subscriber to listen for graph changes and alert the frontend
    this._blix.graphManager.addAllSubscriber(this.graphSubscriber);
    this.graphSubscriber.listen = (graphId: UUID, newGraph: UIGraph) => {
      this._blix.mainWindow?.apis.graphClientApi.graphChanged(graphId, newGraph);
    };
  }

  // TODO: Implement these properly
  async addNode(graphUUID: UUID) {
    return this._blix.graphManager.addNode(
      graphUUID,
      new NodeInstance("fdsa2", "fdsa3", "fdsa4", "fdsa5", "fdsa6", [], [])
    );
  }

  async addEdge(graphUUID: UUID) {
    return this._blix.graphManager.addEdge(graphUUID, "asdf", "asdf");
  }

  async removeNode(graphUUID: UUID) {
    return this._blix.graphManager.removeNode(graphUUID, "asdf");
  }

  async removeEdge(graphUUID: UUID) {
    return this._blix.graphManager.removeEdge(graphUUID, "asdf");
  }

  async setNodePos(uuid: UUID) {
    return this._blix.graphManager.getGraph(uuid);
  }

  async getGraph(uuid: UUID) {
    return this._blix.graphManager.getGraph(uuid);
  }

  async getAllGraphUUIDs() {
    return this._blix.graphManager.getAllGraphUUIDs();
  }
}
