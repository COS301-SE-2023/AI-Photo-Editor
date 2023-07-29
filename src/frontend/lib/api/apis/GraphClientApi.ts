import type { UUID } from "@shared/utils/UniqueEntity";
import type { ElectronWindowApi } from "electron-affinity/window";
import { graphMall } from "@frontend/lib/stores/GraphStore";
import type { UIGraph } from "@shared/ui/UIGraph";

export class GraphClientApi implements ElectronWindowApi<GraphClientApi> {
  // TODO: Consider only sending the _changes_ that took place on the graph
  //       instead of the whole graph each time. This obviously has consistency
  //       implications though if the frontend/backend someone got out-of-sync.

  graphChanged(graphUUID: UUID, newState: UIGraph): void {
    // console.log("GRAPH CHANGED", graphUUID, newState);

    graphMall.refreshGraph(graphUUID, newState);
  }

  graphRemoved(graphUUID: UUID): void {
    graphMall.onGraphRemoved(graphUUID);
  }
}
