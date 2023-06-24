import { type UUID } from "../../../shared/utils/UniqueEntity";
import { CoreGraph } from "./Graph";

// This class stores all the graphs amongst all open projects
// Projects index into this store at runtime to get their graphs
// Yes, this means that technically two projects can share the same graph
// Whether we embrace this or not remains to be seen

export class GraphManager {
  private _graphs: { [id: UUID]: CoreGraph };

  constructor() {
    this._graphs = {};
  }

  createGraph(): UUID {
    const newGraph: CoreGraph = new CoreGraph();
    this._graphs[newGraph.uuid] = newGraph;
    return newGraph.uuid;
  }

  getGraph(uuid: UUID) {
    return this._graphs[uuid];
  }

  deleteGraphs(uuids: UUID[]) {
    uuids.forEach((uuid) => {
      delete this._graphs[uuid];
    });
  }
}
