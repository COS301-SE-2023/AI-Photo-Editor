import { type GraphMetadata } from "../../../shared/ui/UIGraph";
import { type IGraphUIInputs, type INodeUIInputs } from "../../../shared/types";
import { GraphEdge, GraphNode, NodeStylingStore, UIGraph } from "../../../shared/ui/UIGraph";
import { type UUID } from "../../../shared/utils/UniqueEntity";
import { CoreGraph, NodesAndEdgesGraph } from "./CoreGraph";

export enum CoreGraphUpdateEvent {
  graphUpdated, // When nodes / edges change
  uiInputsUpdated, // When UI inputs are changed
  metadataUpdated,
}

// These correspond to parties that can update the CoreGraph
export enum CoreGraphUpdateParticipant {
  system, // The backend system (E.g. A command will trigger this regardless of who called it)
  user, // The frontend user
  ai, // The AI communicating through the backend
}

// Implement this interface to communicate with a CoreGraph instance
export abstract class CoreGraphSubscriber<T> {
  // Index of the subscriber in CoreGraphManager's _subscribers list
  protected _subscriberIndex = -1;
  protected _notifyee?: (graphId: UUID, newGraph: T) => void; // Callback when graph changes

  // The subscriber can choose which events it wants to listen to
  protected listenEvents: Set<CoreGraphUpdateEvent> = new Set([CoreGraphUpdateEvent.graphUpdated]);
  protected listenParticipants: Set<CoreGraphUpdateParticipant> = new Set([
    CoreGraphUpdateParticipant.system,
    CoreGraphUpdateParticipant.user,
    CoreGraphUpdateParticipant.ai,
  ]);

  public set listen(notifyee: (graphId: UUID, newGraph: T) => void) {
    this._notifyee = notifyee;
  }

  public set subscriberIndex(index: number) {
    this._subscriberIndex = index;
  }

  public get subscriberIndex() {
    return this._subscriberIndex;
  }

  public addListenParticipants(participants: CoreGraphUpdateParticipant[]) {
    this.listenParticipants = new Set([...this.listenParticipants, ...participants]);
  }

  public setListenParticipants(participants: CoreGraphUpdateParticipant[]) {
    this.listenParticipants = new Set(participants);
  }

  public getSubscriberParticipants() {
    return this.listenParticipants;
  }

  public addListenEvents(events: CoreGraphUpdateEvent[]) {
    this.listenEvents = new Set([...this.listenEvents, ...events]);
  }

  public setListenEvents(events: CoreGraphUpdateEvent[]) {
    this.listenEvents = new Set(events);
  }

  public getSubscriberEvents() {
    return this.listenEvents;
  }

  // Calls _notifyee with the new graph state
  // Perform representation conversion here (e.g. CoreGraph -> UIGraph)
  abstract onGraphChanged(graphId: UUID, graphData: CoreGraph): void;
}

export abstract class CoreGraphUpdater {
  protected _updaterIndex = -1;
}

export class UIInputsGraphSubscriber extends CoreGraphSubscriber<IGraphUIInputs> {
  onGraphChanged(graphId: UUID, graphData: CoreGraph): void {
    const coreUIInputs = graphData.getAllUIInputs;
    const graphUIInputs: IGraphUIInputs = {};

    // Convert core UI inputs to graph UI inputs
    for (const node in coreUIInputs) {
      if (!coreUIInputs.hasOwnProperty(node)) continue;

      graphUIInputs[node] = {} as INodeUIInputs;
      graphUIInputs[node].inputs = coreUIInputs[node].getInputs;
      graphUIInputs[node].changes = []; // TODO: Potentially tell the frontend exactly what changed
    }

    if (this._notifyee) this._notifyee(graphId, graphUIInputs);
  }
}

export class IPCGraphSubscriber extends CoreGraphSubscriber<UIGraph> {
  onGraphChanged(graphId: UUID, graphData: CoreGraph): void {
    const uiGraph: UIGraph = new UIGraph(graphId);
    uiGraph.metadata = graphData.getMetadata;
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

// For core systems that need to access the CoreGraph directly
export class SystemGraphSubscriber extends CoreGraphSubscriber<CoreGraph> {
  onGraphChanged(graphId: UUID, graphData: CoreGraph): void {
    if (this._notifyee) this._notifyee(graphId, graphData);
  }
}
export class MetadataGraphSubscriber extends CoreGraphSubscriber<GraphMetadata> {
  onGraphChanged(graphId: string, graphData: CoreGraph): void {
    if (this._notifyee) this._notifyee(graphId, graphData.getMetadata);
  }
}
