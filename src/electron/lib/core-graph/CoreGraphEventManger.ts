import { NodeInstance } from "../../lib/registries/ToolboxRegistry";
import type { GraphUUID, SvelvetCanvasPos } from "../../../shared/ui/UIGraph";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import { CoreGraphUpdateParticipant } from "./CoreGraphInteractors";
import type { INodeUIInputs, UIValue } from "../../../shared/types";

export type EdgeBlueprint = {
  graphUUID: GraphUUID;
  nodeFrom: { nodeUUID: UUID; anchorId: string };
  nodeTo: { nodeUUID: UUID; anchorId: string };
};

export type EventArgs = {
  eventPosition?: number;
  event?: CoreGraphEvent;
};

/**
 * Each event has a unique (element, operation) combo which is used to identify types of events.
 * Events also have unique execute and revert data to be used when events are executed and reverted.
 */
export type CoreGraphEvent =
  | {
      element: "Node";
      operation: "Add";
      execute: { graphUUID: GraphUUID; node: NodeInstance; pos: SvelvetCanvasPos };
      revert: { graphUUID: GraphUUID; nodeUUId: UUID };
    }
  | {
      element: "Node";
      operation: "Remove";
      execute: { graphUUID: GraphUUID; nodeUUId: UUID };
      revert: {
        node: { graphUUID: GraphUUID; node: NodeInstance; pos: SvelvetCanvasPos };
        edges: EdgeBlueprint[];
        uiInputs: { [key: string]: UIValue };
      };
    }
  | {
      element: "Edge";
      operation: "Add";
      execute: { graphUUID: UUID; edge: EdgeBlueprint };
      revert: { graphUUID: UUID; edge: EdgeBlueprint };
    }
  | {
      element: "Edge";
      operation: "Remove";
      execute: { graphUUID: UUID; edge: EdgeBlueprint };
      revert: { graphUUID: UUID; edge: EdgeBlueprint };
    }
  | {
      element: "UiInput";
      operation: "Change";
      execute: { graphUUID: GraphUUID; nodeUUId: UUID; nodeUIInputs: INodeUIInputs };
      revert: { graphUUID: GraphUUID; nodeUUId: UUID; nodeUIInputs: INodeUIInputs };
    };

export class CoreGraphEventManager {
  events: CoreGraphEvent[]; // Linear storage for events
  eventPointer: number; // A number indicating the last event that was executed

  constructor() {
    this.events = [];
    this.eventPointer = -1;
  }

  // =============================================
  // Traversal Methods
  // =============================================

  /**
   * This function is used to return the latest event that was executed so that it may be undone.
   * The eventPointer is then decremented to reflect that the lastest event executed is the event preceeding
   * the returned event.
   *
   * @returns Event to handled.
   */
  rollBackwards(): CoreGraphEventResponse {
    if (this.eventPointer === -1) return { status: "error", message: "No more events behind" };
    // console.log("Rolling backwards: ", this.events.length);
    // console.log("Current event index: ", this.eventPointer);
    return {
      status: "success",
      data: { event: this.events[this.eventPointer], position: this.eventPointer-- },
    }; // revert?
  }

  /**
   * This function is used to return the next event to be executed. The eventPointer is pre-incremented
   * so that the next event to be executed is returned.
   *
   * @returns Event to be handled.
   */
  rollForwards(): CoreGraphEventResponse {
    // console.log("Rolling forwards: ", this.events.length);
    // console.log("Current event index: ", this.eventPointer + 1);
    if (this.eventPointer + 1 === this.events.length)
      return { status: "error", message: "No more events ahead" };

    // console.log("Out going pointer value: ", this.eventPointer);

    return {
      status: "success",
      data: { event: this.events[++this.eventPointer], position: this.eventPointer },
    }; // execute?
  }

  /**
   * This function is used to add a new event to the events array.
   * Like Vscode and Word docs as examples, if the pointer is in between events (i.e not at the end of the array),
   * when a new event is added, the events between the pointer and the end of the array are chopped and no longer reachable.
   * Once the event is added the eventPointer is then set to the last index indicating that the event added was
   * the last event to be executed.
   *
   * @param event Event to be added
   * @returns
   */
  addEvent(event: CoreGraphEvent): CoreGraphEventResponse {
    // console.log("New event: ", event);
    // console.log("Pointer: ", this.eventPointer);
    // console.log("Length before add: ", this.events.length);

    this.events =
      this.eventPointer === -1 ? [event] : [...this.events.slice(0, this.eventPointer + 1), event];
    this.eventPointer = this.events.length - 1;
    // console.log("Pointer after adding: ", this.eventPointer);
    // console.log("Events after adding: ", this.events)
    return { status: "success" };
  }

  // =============================================
  // Event Modifiers
  // =============================================

  /**
   * This function will replace all occurrences of an old node UUID with a new node UUID.
   * Problem:
   * When nodes are removed from a graph. The uuid of that node is no longer valid
   * as it gains a new uuid when it is created. Due to this invalidation, all events
   * that contain a the UUID of the node before it was removed need to be given the new UUID of the node.
   *
   * @param oldNodeUUID Old UUID of node
   * @param newNodeUUID New UUID of node
   */
  onAddNode(oldNodeUUID: UUID, newNodeUUID: UUID) {
    for (const event of this.events) {
      if (event.element === "Node") {
        if (event.operation === "Add") {
          if (event.revert.nodeUUId === oldNodeUUID) {
            event.revert.nodeUUId = newNodeUUID;
          }
        } else if (event.operation === "Remove") {
          if (event.execute.nodeUUId === oldNodeUUID) {
            event.execute.nodeUUId = newNodeUUID;
          }
          for (const edge of event.revert.edges) {
            // No cycles so only one could have the uuid
            if (edge.nodeFrom.nodeUUID === oldNodeUUID) {
              edge.nodeFrom.nodeUUID = newNodeUUID;
            } else if (edge.nodeTo.nodeUUID === oldNodeUUID) {
              edge.nodeTo.nodeUUID = newNodeUUID;
            }
          }
        }
      } else if (event.element === "Edge") {
        if (event.operation === "Add" || event.operation === "Remove") {
          // Execute cases
          if (event.execute.edge.nodeFrom.nodeUUID === oldNodeUUID) {
            event.execute.edge.nodeFrom.nodeUUID = newNodeUUID;
          } else if (event.execute.edge.nodeTo.nodeUUID === oldNodeUUID) {
            event.execute.edge.nodeTo.nodeUUID = newNodeUUID;
          }
          // Revert cases
          if (event.revert.edge.nodeFrom.nodeUUID === oldNodeUUID) {
            event.revert.edge.nodeFrom.nodeUUID = oldNodeUUID;
          } else if (event.revert.edge.nodeTo.nodeUUID === oldNodeUUID) {
            event.revert.edge.nodeTo.nodeUUID = newNodeUUID;
          }
        }
      } else if (event.element === "UiInput" && event.operation === "Change") {
        if (event.execute.nodeUUId === oldNodeUUID) {
          // Only effects 1 node
          event.execute.nodeUUId = event.revert.nodeUUId = newNodeUUID;
        }
      }
    }
  }

  /**
   * This function is used to store the position an uiInput values before it is removed so that
   * the old state can then be used when adding the node back to the graph.
   *
   * @param nodeUUID UUID of node that will be deleted.
   * @param pos Position of node
   * @param inputs uiInput values of node
   */
  onRemoveNode(nodeUUID: UUID, pos: SvelvetCanvasPos, inputs: { [key: string]: UIValue }) {
    for (let i = 0; i < this.events.length; i++) {
      const event = this.events[i];
      if (event.element === "Node") {
        if (event.operation === "Add") {
          if (event.revert.nodeUUId === nodeUUID) {
            event.execute.pos = pos;
          }
        } else if (event.operation === "Remove") {
          if (event.execute.nodeUUId === nodeUUID) {
            event.revert.node.pos = pos;
            event.revert.uiInputs = inputs;
          }
        }
      }
      this.events[i] = event;
    }
  }

  reset() {
    this.events = [];
    this.eventPointer = -1;
  }
}

export type CoreGraphEventResponse =
  | {
      status: "success";
      message?: string;
      data?: { position: number; event: CoreGraphEvent };
    }
  | {
      status: "error";
      message: string;
    };

// Store what was done in array so if node added, add it as add node

// When "popping off" i.e moving back, undo currentEvent
// When ,moving forward, do event at new index
