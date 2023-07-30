import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { type UUID } from "../../../../shared/utils/UniqueEntity";
import { type NodeSignature } from "@shared/ui/ToolboxTypes";
import { type INodeUIInputs } from "@shared/types";

// Graphs across projects are stored homogeneously and referenced by UUID
export class GraphApi implements ElectronMainApi<GraphApi> {
  private readonly _blix: Blix;

  constructor(blix: Blix) {
    this._blix = blix;
  }

  // TODO: Implement these properly
  async addNode(graphUUID: UUID, nodeSignature: NodeSignature) {
    return this._blix.graphManager.addNode(
      graphUUID,
      this._blix.toolbox.getNodeInstance(nodeSignature)
      // new NodeInstance("fdsa2", "fdsa3", "fdsa4", "fdsa5", "fdsa6", [], [])
    );
  }

  async addEdge(graphUUID: UUID, anchorA: UUID, anchorB: UUID) {
    return this._blix.graphManager.addEdge(graphUUID, anchorA, anchorB);
  }

  async removeNode(graphUUID: UUID, nodeUUID: UUID) {
    return this._blix.graphManager.removeNode(graphUUID, nodeUUID);
  }

  async removeEdge(graphUUID: UUID, anchorTo: UUID) {
    return this._blix.graphManager.removeEdge(graphUUID, anchorTo);
  }

  async updateUIInputs(graphUUID: UUID, nodeUUID: UUID, nodeUIInputs: INodeUIInputs) {
    return this._blix.graphManager.updateUIInputs(graphUUID, nodeUUID, nodeUIInputs);
  }

  async setNodePos(graphUUID: UUID, nodeUUID: UUID, pos: { x: number; y: number }) {
    return this._blix.graphManager.setPos(graphUUID, nodeUUID, pos.x, pos.y);
  }

  async getGraph(uuid: UUID) {
    return this._blix.graphManager.getGraph(uuid);
  }

  async getAllGraphUUIDs() {
    return this._blix.graphManager.getAllGraphUUIDs();
  }
}
