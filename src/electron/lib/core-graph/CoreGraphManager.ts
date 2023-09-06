import { type UUID } from "../../../shared/utils/UniqueEntity";
import type { MainWindow } from "../api/apis/WindowApi";
import { CoreGraph } from "./CoreGraph";
import {
  CoreGraphSubscriber,
  CoreGraphUpdateEvent,
  CoreGraphUpdateParticipant,
} from "./CoreGraphInteractors";
import { ToolboxRegistry } from "../registries/ToolboxRegistry";
import { NodeInstance } from "../registries/ToolboxRegistry";
import type { INodeUIInputs, QueryResponse } from "../../../shared/types";
import type { MediaOutputId } from "../../../shared/types/media";
import type { GraphMetadata, SvelvetCanvasPos, GraphUUID } from "../../../shared/ui/UIGraph";
import { type CoreGraphEvent, CoreGraphEventManager, type EventArgs } from "./CoreGraphEventManger";
const GRAPH_UPDATED_EVENT = new Set([CoreGraphUpdateEvent.graphUpdated]);
const UIINPUTS_UPDATED_EVENT = new Set([CoreGraphUpdateEvent.uiInputsUpdated]);

// This class stores all the graphs amongst all open projects
// Projects index into this store at runtime to get their graphs
// Yes, this means that technically two projects can share the same graph
// Whether we embrace this or not remains to be seen

export class CoreGraphManager {
  private _graphs: { [id: UUID]: CoreGraph };
  private _subscribers: { [key: UUID]: CoreGraphSubscriber<any>[] };
  private _toolbox: ToolboxRegistry;
  private readonly _mainWindow: MainWindow | undefined;
  // private _importer: CoreGraphImporter;
  private _outputIds: { [key: UUID]: MediaOutputId };
  private _events: { [key: UUID]: CoreGraphEventManager }; // Graph UUID -> Event Manager

  constructor(toolbox: ToolboxRegistry, mainWindow?: MainWindow) {
    this._graphs = {};
    this._outputIds = {};
    this._subscribers = {};
    this._toolbox = toolbox;
    this._mainWindow = mainWindow;
    this._events = {};
  }

  addGraph(coreGraph: CoreGraph) {
    if (coreGraph) {
      this._graphs[coreGraph.uuid] = coreGraph;
      this._events[coreGraph.uuid] = new CoreGraphEventManager();
    }
  }

  addNode(
    graphUUID: UUID,
    node: NodeInstance,
    pos: SvelvetCanvasPos,
    participant: CoreGraphUpdateParticipant,
    eventArgs?: EventArgs
  ): QueryResponse<{ nodeId: UUID; inputs: string[]; outputs: string[] }> {
    if (this._graphs[graphUUID] === undefined)
      return { status: "error", message: "Graph does not exist" };
    const res = this._graphs[graphUUID].addNode(node, pos);

    if (res.status === "success") {
      // console.log("Node added: ", res.data!.nodeId);
      this.onGraphUpdated(graphUUID, GRAPH_UPDATED_EVENT, participant);

      // If node had a UI inputs initializer function
      if (res.data?.uiInputsInitialized) {
        this.onGraphUpdated(graphUUID, UIINPUTS_UPDATED_EVENT, CoreGraphUpdateParticipant.system);
      }

      if (participant === CoreGraphUpdateParticipant.user) {
        this._events[graphUUID].addEvent({
          element: "Node",
          operation: "Add",
          execute: { graphUUID, node, pos },
          revert: { graphUUID, nodeUUId: res.data.nodeId },
        });
      } else if (eventArgs) {
        const { event } = eventArgs;
        if (event?.element === "Node" && event.operation === "Add") {
          const old = event.revert.nodeUUId; // Old uuid currently in the event
          this._events[graphUUID].onAddNode(old, res.data.nodeId); // Update uuid of node throughout all events
          // console.log("Old UUID: ", old);
          // console.log("NEW UUID: ", res.data!.nodeId);
        }
      }
    }
    return res;
  }

  removeNode(
    graphUUID: UUID,
    nodeUUID: UUID,
    participant: CoreGraphUpdateParticipant,
    eventArgs?: EventArgs
  ): QueryResponse {
    if (this._graphs[graphUUID] === undefined)
      return { status: "error", message: "Graph does not exist" };
    const signature = this._graphs[graphUUID].getNodes[nodeUUID].getSignature;
    const pos = this._graphs[graphUUID].getNodes[nodeUUID].getStyling!.getPosition;
    const res = this._graphs[graphUUID].removeNode(nodeUUID);
    if (res.status === "success") {
      this.onGraphUpdated(graphUUID, GRAPH_UPDATED_EVENT, participant);
      if (participant === CoreGraphUpdateParticipant.user) {
        const node = this._toolbox.getNodeInstance(signature);
        this._events[graphUUID].addEvent({
          element: "Node",
          operation: "Remove",
          execute: { graphUUID, nodeUUId: nodeUUID },
          revert: {
            node: { graphUUID, node, pos },
            edges: res.data.edges,
            uiInputs: res.data.uiInputs[nodeUUID].getInputs,
          },
        });
      }
      delete this._outputIds[nodeUUID];
    }
    return res;
  }

  addEdge(
    graphUUID: UUID,
    anchorA: UUID,
    anchorB: UUID,
    participant: CoreGraphUpdateParticipant,
    eventArgs?: EventArgs
  ): QueryResponse<{ edgeId: UUID }> {
    if (this._graphs[graphUUID] === undefined)
      return { status: "error", message: "Graph does not exist" };

    const res = this._graphs[graphUUID].addEdge(anchorA, anchorB);

    if (res.status === "success") {
      this.onGraphUpdated(graphUUID, GRAPH_UPDATED_EVENT, participant);
      if (participant === CoreGraphUpdateParticipant.user) {
        const edge = this._graphs[graphUUID].createEdgeBlueprint(anchorA, anchorB);
        this._events[graphUUID].addEvent({
          element: "Edge",
          operation: "Add",
          execute: { graphUUID, edge },
          revert: { graphUUID, edge },
        });
      }
    }
    return res;
  }

  removeEdge(
    graphUUID: UUID,
    anchorTo: UUID,
    participant: CoreGraphUpdateParticipant,
    eventArgs?: EventArgs
  ): QueryResponse {
    if (this._graphs[graphUUID] === undefined)
      return { status: "error", message: "Graph does not exist" };
    const res = this._graphs[graphUUID].removeEdge(anchorTo);
    if (res.status === "success") {
      this.onGraphUpdated(graphUUID, GRAPH_UPDATED_EVENT, participant);
      if (participant === CoreGraphUpdateParticipant.user) {
        const edge = this._graphs[graphUUID].createEdgeBlueprint(
          res.data.anchorFrom,
          res.data.anchorTo
        );
        this._events[graphUUID].addEvent({
          element: "Edge",
          operation: "Remove",
          execute: { graphUUID, edge },
          revert: { graphUUID, edge },
        });
      }
    }
    return res;
  }

  updateUIInputs(
    graphUUID: UUID,
    nodeUUID: UUID,
    nodeUIInputs: INodeUIInputs,
    participant: CoreGraphUpdateParticipant,
    eventArgs?: EventArgs
  ): QueryResponse {
    if (this._graphs[graphUUID] === undefined)
      return { status: "error", message: "Graph does not exist" };

    if (!nodeUIInputs) return { status: "error", message: "No node UI inputs provided" };

    // console.log("Update node -> ", nodeUUID);

    let oldInputs = this._graphs[graphUUID].getUIInputs(nodeUUID);

    oldInputs = oldInputs ? oldInputs : {};
    // define the old state
    const old = { inputs: oldInputs, changes: nodeUIInputs.changes } as INodeUIInputs;
    const res = this._graphs[graphUUID].updateUIInputs(nodeUUID, nodeUIInputs);

    const signature = this._graphs[graphUUID].getNodes[nodeUUID].getSignature;

    if (res.status === "success") {
      // console.log("Old: ", old);
      // console.log("New: ", nodeUIInputs);
      // console.log("P:", participant);

      // TODO: Fix so that updating of ouput node ids works
      // Problem: frontend is seeing change and calling function which in turn is making new events which throws off the event order
      // You will need to just try it and see what happens
      // if(nodeUIInputs.inputs.outputId && old.inputs.outputId && (nodeUIInputs.inputs.outputId !== old.inputs.outputId || nodeUIInputs.changes !== old.changes)) //  Used to not check for output node changes
      if (!nodeUIInputs.inputs.outputId)
        if (
          participant === CoreGraphUpdateParticipant.user &&
          !(JSON.stringify(old) === JSON.stringify(nodeUIInputs))
        ) {
          // Trying to not add events where frontend has sent it where it is exactly the same
          // console.log("Not the same inputs");
          this._events[graphUUID].addEvent({
            element: "UiInput",
            operation: "Change",
            execute: { graphUUID, nodeUUId: nodeUUID, nodeUIInputs },
            revert: { graphUUID, nodeUUId: nodeUUID, nodeUIInputs: old },
          });
        }
      // Determine whether the update should trigger the graph to recompute
      const uiConfigs = this._toolbox.getNodeInstance(signature).uiConfigs;
      const changes = nodeUIInputs.changes;

      if (signature === "blix.output") {
        this._outputIds[nodeUUID] = nodeUIInputs.inputs.outputId as string;
        this._mainWindow?.apis.mediaClientApi.onMediaOutputIdsChanged(
          new Set(Object.values(this._outputIds))
        );
      }

      let shouldUpdate = false;
      for (const change of changes) {
        if (uiConfigs[change].triggerUpdate) {
          shouldUpdate = true;
          break;
        }
      }

      if (shouldUpdate) {
        this.onGraphUpdated(graphUUID, UIINPUTS_UPDATED_EVENT, participant);
      }
    }
    return res;
  }

  updateUIPositions(graphUUID: UUID, positions: { [key: UUID]: SvelvetCanvasPos }) {
    this._graphs[graphUUID].UIPositions = positions;
  }

  setPos(
    graphUUID: UUID,
    nodeUUID: UUID,
    x: number,
    y: number,
    participant: CoreGraphUpdateParticipant
  ): QueryResponse {
    if (this._graphs[graphUUID] === undefined)
      return { status: "error", message: "Graph does not exist" };
    const res = this._graphs[graphUUID].setNodePos(nodeUUID, { x, y });
    // if (res) this.onGraphUpdated(graphUUID);
    // Style changes shouldn't update the subscribers
    // We only need this state when reloading the graph
    return res;
  }

  createGraph(): UUID {
    const newGraph: CoreGraph = new CoreGraph();
    this._graphs[newGraph.uuid] = newGraph;
    this._events[newGraph.uuid] = new CoreGraphEventManager();
    return newGraph.uuid;
  }

  // For testing purposes
  loadGraph(graph: CoreGraph): void {
    this._graphs[graph.uuid] = graph;
    this._events[graph.uuid] = new CoreGraphEventManager();
  }

  getGraph(uuid: UUID) {
    return this._graphs[uuid];
  }

  getSubscribers(graphUUID: UUID) {
    return this._subscribers[graphUUID];
  }

  deleteGraphs(uuids: UUID[]): boolean[] {
    const flags: boolean[] = [];

    uuids.forEach((uuid) => {
      if (uuid in this._graphs) {
        delete this._graphs[uuid];
        delete this._subscribers[uuid];
        delete this._events[uuid];
        this._mainWindow?.apis.graphClientApi.graphRemoved(uuid);
        flags.push(true);
      } else {
        flags.push(false);
      }
    });

    return flags;
  }

  getAllGraphUUIDs() {
    return Object.keys(this._graphs).map((uuid) => uuid);
  }

  updateGraphMetadata(
    graphUUID: UUID,
    updatedMetadata: Partial<GraphMetadata>,
    participant: CoreGraphUpdateParticipant
  ) {
    const graph = this._graphs[graphUUID];

    if (!graph) {
      return {
        status: "error",
        message: "Graph does not exist",
      } satisfies QueryResponse;
    }

    const res = graph.updateMetadata(updatedMetadata);
    if (res.status === "success") {
      this.onGraphUpdated(graphUUID, new Set([CoreGraphUpdateEvent.metadataUpdated]), participant);
    }
    return res;
  }

  // Notify all subscribers of change
  onGraphUpdated(
    graphUUID: UUID,
    events: Set<CoreGraphUpdateEvent>,
    participant: CoreGraphUpdateParticipant
  ) {
    if (this._subscribers[graphUUID] !== undefined) {
      this._subscribers[graphUUID].forEach((subscriber) => {
        if (
          checkForCommonElement(events, subscriber.getSubscriberEvents()) &&
          subscriber.getSubscriberParticipants().has(participant)
        ) {
          subscriber.onGraphChanged(graphUUID, this._graphs[graphUUID]);
        }
      });
    }
    if (this._subscribers.all !== undefined) {
      this._subscribers.all.forEach((subscriber) => {
        if (
          checkForCommonElement(events, subscriber.getSubscriberEvents()) &&
          subscriber.getSubscriberParticipants().has(participant)
        ) {
          subscriber.onGraphChanged(graphUUID, this._graphs[graphUUID]);
        }
      });
    }
  }

  // Subscribe to all graph events
  addAllSubscriber(subscriber: CoreGraphSubscriber<any>) {
    if (this._subscribers.all === undefined) {
      this._subscribers.all = [];
    }

    subscriber.subscriberIndex = this._subscribers.all.length;
    this._subscribers.all.push(subscriber);
  }

  // Subscribe to a specific graph's events
  addSubscriber(graphUUID: UUID, subscriber: CoreGraphSubscriber<any>) {
    if (this._subscribers[graphUUID] === undefined) {
      this._subscribers[graphUUID] = [];
    }

    subscriber.subscriberIndex = this._subscribers[graphUUID].length;
    this._subscribers[graphUUID].push(subscriber);
  }

  // This needs to be implemented
  removeSubscriber() {
    return;
  }

  // ===============================================
  // Graph Events
  // ===============================================

  /**
   * This function receives the event to be redone, issues it to be executed and returns the response.
   *
   * @param graphUUID UUID of graph to which the current event must be redone.
   * @returns A response indicating success or error with data or a message respectively.
   */
  redoEvent(graphUUID: GraphUUID): QueryResponse {
    const res = this._events[graphUUID].rollForwards();
    if (res.status === "success") {
      return this.handleEvent(res.data!.event, res.data!.position, true);
    } else {
      return { status: "error", message: res.message };
    }
  }

  /**
   * This function receives the event to be undone, issues it to be reverted and returns the response.
   *
   * @param graphUUID UUID of graph to which the current event must be undone.
   * @returns A response indicating success or error with data or a message respectively.
   */
  undoEvent(graphUUID: GraphUUID): QueryResponse {
    const res = this._events[graphUUID].rollBackwards();
    if (res.status === "success") {
      return this.handleEvent(res.data!.event, res.data!.position, false);
    } else {
      return { status: "error", message: res.message };
    }
  }

  /**
   * This function handles the business logic of how events should be run.
   * These are the current event types:
   * 1. Adding a node
   * 2. Removing a node
   * 3. Adding an edge
   * 4. Removing an edge
   * 5. Changing a uiInput
   *
   * Each Event can either be executed or reverted with their own logic.
   * Events when created, store relevant information so that they may be executed/reverted
   * when needed. There are cases where node UUIDs are worthless as nodes have been removed and added causing
   * different UUIDS to be used. This is why the helper function onAddNode() can be found. The same goes for
   * onRemoveNode, used to store information needed for other events before that node is removed.
   *
   * @param event Event to be handled.
   * @param eventPosition Position of event in the events array.
   * @param execute A flag that specifies whether the event is to be executed or reverted.
   * @returns A response indicating success or error with data or a message respectively.
   */
  handleEvent(event: CoreGraphEvent, eventPosition: number, execute: boolean): QueryResponse {
    if (event.element === "Node") {
      if (event.operation === "Add") {
        if (execute) {
          const { graphUUID, node, pos } = event.execute;
          return this.addNode(graphUUID, node, pos, CoreGraphUpdateParticipant.system, { event });
        } else {
          const { graphUUID, nodeUUId } = event.revert;
          const pos = this._graphs[graphUUID].getNodes[nodeUUId].getStyling!.getPosition;
          const inputs = this._graphs[graphUUID].getUIInputs(nodeUUId);
          this._events[graphUUID].onRemoveNode(nodeUUId, pos, inputs!);
          return this.removeNode(graphUUID, nodeUUId, CoreGraphUpdateParticipant.system);
        }
      } else if (event.operation === "Remove") {
        if (execute) {
          const { graphUUID, nodeUUId } = event.execute;
          const pos = this._graphs[graphUUID].getNodes[nodeUUId].getStyling!.getPosition;
          const inputs = this._graphs[graphUUID].getUIInputs(nodeUUId);
          this._events[graphUUID].onRemoveNode(nodeUUId, pos, inputs!);
          return this.removeNode(graphUUID, nodeUUId, CoreGraphUpdateParticipant.system);
        } else {
          // Add node and edges as one operation
          const { node, edges, uiInputs } = event.revert;
          const graph = this._graphs[node.graphUUID];
          const nodeRes = graph.addNode(node.node, node.pos, uiInputs);
          if (nodeRes.status === "success") {
            // Get old uuid used to execute removing the node
            const { nodeUUId } = event.execute;
            this._events[node.graphUUID].onAddNode(nodeUUId, nodeRes.data.nodeId);

            const edgesAdded: string[] = [];

            for (const edge of edges) {
              const anchorA = this._graphs[edge.graphUUID].getNodeAnchor(
                edge.nodeFrom.nodeUUID,
                edge.nodeFrom.anchorId
              );
              const anchorB = this._graphs[edge.graphUUID].getNodeAnchor(
                edge.nodeTo.nodeUUID,
                edge.nodeTo.anchorId
              );
              if (anchorA.status === "error") return anchorA;
              if (anchorB.status === "error") return anchorB;
              const res = graph.addEdge(anchorA.data!.anchorUUID, anchorB.data!.anchorUUID);
              edgesAdded.push(res.status);
            }

            // Maybe count edge events to lower the time of search

            if (edgesAdded.includes("error")) {
              return { status: "error", message: "Edges could not be added back to node" };
            }

            this.onGraphUpdated(
              node.graphUUID,
              new Set([...GRAPH_UPDATED_EVENT, CoreGraphUpdateEvent.uiInputsUpdated]),
              CoreGraphUpdateParticipant.system
            );

            // this.updateUIInputs(node.graphUUID, nodeRes.data!.nodeId, { inputs: uiInputs, changes: [...Object.keys(uiInputs)] }, node.participant, { eventPosition } );
            return nodeRes;
          } else {
            return { status: "error", message: "Node could not be added back to graph" };
          }
        }
      }
    } else if (event.element === "Edge") {
      if (event.operation === "Add") {
        if (execute) {
          const { graphUUID, edge } = event.execute;
          const anchorA = this._graphs[graphUUID].getNodeAnchor(
            edge.nodeFrom.nodeUUID,
            edge.nodeFrom.anchorId
          );
          const anchorB = this._graphs[graphUUID].getNodeAnchor(
            edge.nodeTo.nodeUUID,
            edge.nodeTo.anchorId
          );
          if (anchorA.status === "success" && anchorB.status === "success")
            return this.addEdge(
              graphUUID,
              anchorA.data!.anchorUUID,
              anchorB.data!.anchorUUID,
              CoreGraphUpdateParticipant.system
            );
          return { status: "error", message: "Could not execute Add Edge Event" };
        } else {
          const { graphUUID, edge } = event.revert;
          const anchorB = this._graphs[graphUUID].getNodeAnchor(
            edge.nodeTo.nodeUUID,
            edge.nodeTo.anchorId
          );
          if (anchorB.status === "success")
            return this.removeEdge(
              graphUUID,
              anchorB.data!.anchorUUID,
              CoreGraphUpdateParticipant.system
            );
          return { status: "error", message: "Could not revert Add Edge Event" };
        }
      } else if (event.operation === "Remove") {
        if (execute) {
          const { graphUUID, edge } = event.execute;
          const anchorB = this._graphs[graphUUID].getNodeAnchor(
            edge.nodeTo.nodeUUID,
            edge.nodeTo.anchorId
          );
          if (anchorB.status === "success")
            return this.removeEdge(
              graphUUID,
              anchorB.data!.anchorUUID,
              CoreGraphUpdateParticipant.system
            );
          return { status: "error", message: "Could not revert Add Edge Event" };
        } else {
          const { graphUUID, edge } = event.execute;
          const anchorA = this._graphs[graphUUID].getNodeAnchor(
            edge.nodeFrom.nodeUUID,
            edge.nodeFrom.anchorId
          );
          const anchorB = this._graphs[graphUUID].getNodeAnchor(
            edge.nodeTo.nodeUUID,
            edge.nodeTo.anchorId
          );
          if (anchorA.status === "success" && anchorB.status === "success")
            return this.addEdge(
              graphUUID,
              anchorA.data!.anchorUUID,
              anchorB.data!.anchorUUID,
              CoreGraphUpdateParticipant.system
            );
          return { status: "error", message: "Could not execute Add Edge Event" };
        }
      }
    } else if (event.element === "UiInput") {
      if (event.operation === "Change") {
        if (execute) {
          const { graphUUID, nodeUUId, nodeUIInputs } = event.execute;
          return this.updateUIInputs(
            graphUUID,
            nodeUUId,
            nodeUIInputs,
            CoreGraphUpdateParticipant.system
          );
        } else {
          const { graphUUID, nodeUUId, nodeUIInputs } = event.revert;
          return this.updateUIInputs(
            graphUUID,
            nodeUUId,
            nodeUIInputs,
            CoreGraphUpdateParticipant.system
          );
        }
      }
    }
    return { status: "error", message: "Could not undo/redo event" };
  }
}

function checkForCommonElement<T>(setA: Set<T>, setB: Set<T>) {
  for (const elem of setA) {
    if (setB.has(elem)) return true;
  }
  return false;
}
