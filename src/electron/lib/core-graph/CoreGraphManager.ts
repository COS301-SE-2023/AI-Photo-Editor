import logger from "../../utils/logger";
import { type UUID } from "../../../shared/utils/UniqueEntity";
import type { MainWindow } from "../api/apis/WindowApi";
import { CoreGraph } from "./CoreGraph";
import { CoreGraphSubscriber } from "./CoreGraphInteractors";
import { ToolboxRegistry } from "../registries/ToolboxRegistry";
import { CoreGraphImporter } from "./CoreGraphImporter";
import { type GraphToJSON } from "./CoreGraphExporter";
import { NodeInstance } from "../registries/ToolboxRegistry";

// This class stores all the graphs amongst all open projects
// Projects index into this store at runtime to get their graphs
// Yes, this means that technically two projects can share the same graph
// Whether we embrace this or not remains to be seen

export class CoreGraphManager {
  private _graphs: { [id: UUID]: CoreGraph };
  private _mainWindow: MainWindow;
  private _subscribers: { [key: UUID]: CoreGraphSubscriber<any>[] };
  private _toolbox: ToolboxRegistry;
  private _importer: CoreGraphImporter;

  constructor(mainWindow: MainWindow, toolbox: ToolboxRegistry) {
    this._mainWindow = mainWindow;
    this._graphs = {};
    this._subscribers = {};
    this._toolbox = toolbox;
    this._importer = new CoreGraphImporter(this._toolbox);
    // Test send dummy graph to frontend
    this.testingSendToClient();
  }

  testingSendToClient() {
    this.createGraph(); // TODO: REMOVE; This is just for testing
    this.createGraph();
    this.createGraph();
    this.createGraph();

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

  importGraph(format: string, data: GraphToJSON | string) {
    const graph: CoreGraph = this._importer.import(format, data);
    this._graphs[graph.uuid] = graph;
    return graph; // For testing purposes, dont know what to do with this yet
  }

  addNode(graphUUID: UUID, node: NodeInstance): boolean {
    logger.info("Adding node to graph in manager...");
    if (this._graphs[graphUUID] === undefined) return false;
    const res = this._graphs[graphUUID].addNode(node);
    if (res) this.onGraphUpdated(graphUUID);
    return res !== "";
  }

  addEdge(graphUUID: UUID, anchorA: UUID, anchorB: UUID): boolean {
    logger.warn("Adding edge to graph in manager...");
    if (this._graphs[graphUUID] === undefined) return false;
    const res = this._graphs[graphUUID].addEdge(anchorA, anchorB);
    if (res) this.onGraphUpdated(graphUUID);
    return res;
  }

  removeNode(graphUUID: UUID, nodeUUID: UUID): boolean {
    logger.warn("Removing node from graph in manager...");
    if (this._graphs[graphUUID] === undefined) return false;
    const res = this._graphs[graphUUID].removeNode(nodeUUID);
    if (res) this.onGraphUpdated(graphUUID);
    return res;
  }

  removeEdge(graphUUID: UUID, anchorTo: UUID): boolean {
    logger.warn("Removing edge from graph in manager...");
    if (this._graphs[graphUUID] === undefined) return false;
    const res = this._graphs[graphUUID].removeEdge(anchorTo);
    if (res) this.onGraphUpdated(graphUUID);
    return res;
  }

  setPos(graphUUID: UUID, nodeUUID: UUID, x: number, y: number): boolean {
    if (this._graphs[graphUUID] === undefined) return false;
    const res = this._graphs[graphUUID].setNodePos(nodeUUID, { x, y });
    // if (res) this.onGraphUpdated(graphUUID);
    // Style changes shouldn't update the subscribers
    // We only need this state when reloading the graph
    return res;
  }

  createGraph(): UUID {
    const newGraph: CoreGraph = new CoreGraph();
    this._graphs[newGraph.uuid] = newGraph;
    return newGraph.uuid;
  }

  // For testing purposes
  loadGraph(graph: CoreGraph): void {
    this._graphs[graph.uuid] = graph;
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

  // Notify all subscribers of change
  onGraphUpdated(graphUUID: UUID) {
    if (this._subscribers[graphUUID] !== undefined) {
      this._subscribers[graphUUID].forEach((subscriber) => {
        subscriber.onGraphChanged(graphUUID, this._graphs[graphUUID]);
      });
    }
    if (this._subscribers.all !== undefined) {
      this._subscribers.all.forEach((subscriber) => {
        subscriber.onGraphChanged(graphUUID, this._graphs[graphUUID]);
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

  removeSubscriber() {
    return;
  }
}
