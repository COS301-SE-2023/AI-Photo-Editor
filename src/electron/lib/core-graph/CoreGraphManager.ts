import Main from "electron/main";
import { type UUID } from "../../../shared/utils/UniqueEntity";
import type { MainWindow } from "../api/apis/WindowApi";
import type { UIGraph } from "../../../frontend/stores/GraphStore";
import { CoreGraph } from "./CoreGraph";

// This class stores all the graphs amongst all open projects
// Projects index into this store at runtime to get their graphs
// Yes, this means that technically two projects can share the same graph
// Whether we embrace this or not remains to be seen

export class CoreGraphManager {
  private _graphs: { [id: UUID]: CoreGraph };
  private _mainWindow: MainWindow;

  constructor(mainWindow: MainWindow) {
    this._mainWindow = mainWindow;
    this._graphs = {};

    // Test send dummy graph to frontend
    this.testingSendToClient();
  }

  testingSendToClient() {
    this.createGraph(); // TODO: REMOVE; This is just for testing
    const ids = this.getAllGraphUUIDs();

    // There currently isn't proper implementation to map the CoreGraph to a
    // UIGraph with the frontend nodes and anchors. Sorry that I didn't do this,
    // not sure if Jake can help with this cause he made the CoreGraph
    // setTimeout(() => {
    //   setInterval(() => {
    //     if (this._mainWindow)
    //       this._mainWindow?.apis.clientGraphApi.graphChanged(ids[0], { uuid: ids[0] } as UIGraph);
    //   }, 5000);
    // }, 5000);
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

  getAllGraphUUIDs() {
    return Object.keys(this._graphs).map((uuid) => uuid);
  }

  coreToUiGraph(graph: CoreGraph) {
    return;
  }
}
