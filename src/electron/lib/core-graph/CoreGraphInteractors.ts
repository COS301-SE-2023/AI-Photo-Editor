import { GraphEdge, GraphNode, NodeStylingStore, UIGraph } from "../../../shared/ui/UIGraph";
import { type UUID } from "../../../shared/utils/UniqueEntity";
import { CoreGraph, NodesAndEdgesGraph } from "./CoreGraph";

// Implement this interface to communicate with a CoreGraph instance
export abstract class CoreGraphSubscriber<T> {
  // Index of the subscriber in CoreGraphManager's _subscribers list
  protected _subscriberIndex = -1;
  protected _notifyee?: (graphId: UUID, newGraph: T) => void; // Callback when graph changes

  public set listen(notifyee: (graphId: UUID, newGraph: T) => void) {
    this._notifyee = notifyee;
  }

  public set subscriberIndex(index: number) {
    this._subscriberIndex = index;
  }

  public get subscriberIndex() {
    return this._subscriberIndex;
  }

  // Calls _notifyee with the new graph state
  // Perform representation conversion here (e.g. CoreGraph -> UIGraph)
  abstract onGraphChanged(graphId: UUID, graphData: CoreGraph): void;
}

export abstract class CoreGraphUpdater {
  protected _updaterIndex = -1;
}

export class IPCGraphSubscriber extends CoreGraphSubscriber<UIGraph> {
  onGraphChanged(graphId: UUID, graphData: CoreGraph): void {
    const uiGraph: UIGraph = new UIGraph(graphId);
    const nodesAndEdges: NodesAndEdgesGraph = graphData.exportNodesAndEdges();

    for (const node in nodesAndEdges.nodes) {
      if (!nodesAndEdges.nodes.hasOwnProperty(node)) continue;

      uiGraph.nodes[node] = new GraphNode(node);
      uiGraph.nodes[node].signature = nodesAndEdges.nodes[node].signature;

      // Provide mapping from toolbox anchor id's (local to node) to their backend UUIDs (global in graph)
      // TODO: This implememntation assumes that an input anchor cannot have the same id as an output anchor.
      //       We might wanna change this in the future
      for (const anchor in nodesAndEdges.nodes[node].inputs) {
        if (!nodesAndEdges.nodes[node].inputs.hasOwnProperty(anchor)) continue;
        const reducedAnchor = nodesAndEdges.nodes[node].inputs[anchor];

        uiGraph.nodes[node].anchorUUIDs[reducedAnchor.id] = anchor;
      }

      for (const anchor in nodesAndEdges.nodes[node].outputs) {
        if (!nodesAndEdges.nodes[node].outputs.hasOwnProperty(anchor)) continue;
        const reducedAnchor = nodesAndEdges.nodes[node].outputs[anchor];

        uiGraph.nodes[node].anchorUUIDs[reducedAnchor.id] = anchor;
      }

      // for (const anchor in nodesAndEdges.nodes[node].anchorUUIDs) {
      //   if (!nodesAndEdges.nodes[node].anchorUUIDs.hasOwnProperty(anchor)) continue;
      //   uiGraph.nodes[node].anchorUUIDs
      // }
    }

    for (const edge in nodesAndEdges.edges) {
      if (!nodesAndEdges.edges.hasOwnProperty(edge)) continue;
      const edgeData = nodesAndEdges.edges[edge];

      uiGraph.edges[edge] = new GraphEdge(
        edge,
        edgeData.nodeUUIDFrom,
        edgeData.nodeUUIDTo,
        edgeData.anchorIdFrom,
        edgeData.anchorIdTo
      );
    }

    // console.log("UIGRAPH EDGES", uiGraph.edges);

    if (this._notifyee) this._notifyee(graphId, uiGraph);
  }
}

// export class BackendSystemGraphSubscriber extends CoreGraphSubscriber<CoreGraph> {
//   onGraphChanged(graphId: UUID, graphData: CoreGraph): void {
//     if (this._notifyee) this._notifyee(graphId, graphData);
//   }
// }
