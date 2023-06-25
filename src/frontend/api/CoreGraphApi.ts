import type { UUID } from "@shared/utils/UniqueEntity";
import type { ElectronWindowApi } from "electron-affinity/window";
import { UIGraph, graphMall } from "@frontend/stores/GraphStore";

export class CoreGraphApi implements ElectronWindowApi<CoreGraphApi> {
  // TODO: Consider only sending the _changes_ that took place on the graph
  //       instead of the whole graph each time. This obviously has consistency
  //       implications though if the frontend/backend someone got out-of-sync.

  graphChanged(graphUUID: UUID, newState: UIGraph): void {
    // console.log("GRAPH CHANGED", graphUUID, newState);

    graphMall.update((mall) => {
      // Only update the graph that has changed
      mall.refreshGraph(graphUUID, newState);

      return mall;
    });
  }
}
