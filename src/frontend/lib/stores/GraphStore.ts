import type { AnchorUUID } from "@electron/lib/core-graph/CoreGraph";
import type { IGraphUIInputs, INodeUIInputs } from "@shared/types";
import type { NodeSignature } from "@shared/ui/ToolboxTypes";
import {
  UIGraph,
  GraphNode,
  type GraphNodeUUID,
  type GraphUUID,
  type SvelvetCanvasPos,
  constructUIValueStore,
  type GraphMetadata,
} from "@shared/ui/UIGraph";
import { writable, get, derived, type Writable, type Readable } from "svelte/store";
import { toolboxStore } from "./ToolboxStore";
import type { MediaOutputId } from "@shared/types/media";
import { tick } from "svelte";

// When the the CoreGraphApi type has to be imported into the backend
// (WindowApi.ts) so that the API can be bound then it tries to import the type
// below because the GraphStore gets used in the CoreGraphApi (its like one long
// type dependency chain), this seems to cause some sort of duplicate export
// issue originating from the svelvet node files when it tries to check the
// types at compile time: node_modules/svelvet/dist/types/index.d.ts:4:1 - error
// TS2308: Module './general' has already exported a member named
// 'ActiveIntervals'. Consider explicitly re-exporting to resolve the ambiguity.

// Not sure how to solve this at the moment, so had to add a temp fix below
// unfortunately because of time constraints.

// import type { Connections } from "blix_svelvet";
// type Connections = (string | number | [string | number, string | number] | null)[];

// TODO: Return a GraphStore in createGraphStore for typing
export class GraphStore {
  graphStore: Writable<UIGraph>;
  uiInputUnsubscribers: { [key: GraphNodeUUID]: (() => void)[] } = {};
  uiInputSubscribers: { [key: GraphNodeUUID]: () => void } = {};

  constructor(public uuid: GraphUUID) {
    // Starts with empty graph
    this.graphStore = writable<UIGraph>(new UIGraph(uuid));
  }

  public refreshUIInputs(newUIInputs: IGraphUIInputs) {
    this.graphStore.update((graph) => {
      for (const node of Object.keys(newUIInputs)) {
        if (!graph.nodes[node]) continue;

        for (const input of Object.keys(newUIInputs[node].inputs)) {
          graph.nodes[node].inputUIValues.inputs[input].set(newUIInputs[node].inputs[input]);
        }
      }

      return graph;
    });
  }

  public refreshMetadata(newMetadata: GraphMetadata) {
    this.graphStore.update((graph) => {
      graph.metadata = newMetadata;
      return graph;
    });
  }

  // Called by GraphClientApi when the command registry changes
  public refreshStore(newGraph: UIGraph) {
    this.graphStore.update((graph) => {
      graph.metadata = newGraph.metadata;
      graph.edges = newGraph.edges;

      const oldNodes = graph.nodes;
      graph.nodes = newGraph.nodes;

      for (const node of Object.keys(graph.nodes)) {
        if (oldNodes[node]) {
          // Node carried over from old graph, maintain its styling / UI inputs
          graph.nodes[node].styling = oldNodes[node].styling;
          graph.nodes[node].inputUIValues = oldNodes[node].inputUIValues;
        } else {
          // If node has a UI input, create a store and subscribe to it
          const toolboxNode = toolboxStore.getNode(graph.nodes[node].signature);

          if (toolboxNode.ui) {
            graph.nodes[node].inputUIValues = constructUIValueStore(
              toolboxNode.ui,
              toolboxNode.uiConfigs
            );

            const inputs = graph.nodes[node].inputUIValues.inputs;
            // TODO: Investigate this; for some reason not all the keys in `inputs`
            //       are available off the bat unless you wait for the next tick()
            tick()
              .then(() => {
                this.uiInputUnsubscribers[node] = [];
                for (const input in inputs) {
                  if (!inputs.hasOwnProperty(input)) continue;
                  // console.log("SUB TO", node, "-->>", input)
                  this.uiInputUnsubscribers[node].push(
                    inputs[input].subscribe(() => {
                      // console.log("UPDATE UI INPUTS", node, "->", input);
                      this.updateUIInputs(node, input).catch((err) => {
                        return;
                      });
                    })
                  );
                }
              })
              .catch(() => {
                return;
              });
          }
        }
      }

      // Remove any old UI input unsubscribers
      for (const node of Object.keys(oldNodes)) {
        if (!graph.nodes[node] && this.uiInputUnsubscribers[node]) {
          // Node is no longer in the graph and has an unsub function
          // console.log("UNSUB FROM", node);
          for (const unsub of this.uiInputUnsubscribers[node]) {
            unsub();
          }
          delete this.uiInputUnsubscribers[node];
        }
      }

      return graph;
    });
  }

  async addNode(nodeSignature: NodeSignature, pos?: SvelvetCanvasPos) {
    const thisUUID = get(this.graphStore).uuid;
    const res = await window.apis.graphApi.addNode(thisUUID, nodeSignature);

    // if (pos) {
    //   console.log("SET NODE POS", pos);
    //   const posRes = await window.apis.graphApi.setNodePos(thisUUID, res, pos);
    // }

    return res.status;
  }

  async addEdge(anchorA: AnchorUUID, anchorB: AnchorUUID) {
    const thisUUID = get(this.graphStore).uuid;
    const res = await window.apis.graphApi.addEdge(thisUUID, anchorA, anchorB);

    return res.status;
  }

  async updateUIInputs(nodeUUID: GraphNodeUUID, inputId: string) {
    const thisUUID = get(this.graphStore).uuid;
    const node = get(this.graphStore).nodes[nodeUUID];
    const nodeInputs = node.inputUIValues;

    // Extract values from stores
    const payload: INodeUIInputs = { inputs: {}, changes: [inputId] };

    for (const input of Object.keys(nodeInputs.inputs)) {
      payload.inputs[input] = get(nodeInputs.inputs[input]);
    }

    const res = await window.apis.graphApi.updateUIInputs(thisUUID, nodeUUID, payload);

    // Notify our UI subscribers
  }

  async removeNode(nodeUUID: GraphNodeUUID) {
    const thisUUID = get(this.graphStore).uuid;
    const res = await window.apis.graphApi.removeNode(thisUUID, nodeUUID);
    return false;
  }

  async removeEdge(anchorTo: AnchorUUID) {
    const thisUUID = get(this.graphStore).uuid;
    const res = await window.apis.graphApi.removeEdge(thisUUID, anchorTo);
    return false;
  }

  public get update() {
    return this.graphStore.update;
  }

  public get subscribe() {
    return this.graphStore.subscribe;
  }

  public addUISubscriber(callback: () => null) {
    // TODO
    return;
  }

  public getNode(nodeUUID: GraphNodeUUID): GraphNode {
    return get(this.graphStore).nodes[nodeUUID];
  }

  public getNodesReactive() {
    return derived(this.graphStore, (graph) => {
      return Object.values(graph.nodes);
    });
  }

  public getOutputNodesByIdReactive(): Readable<{ [key: GraphNodeUUID]: GraphNode }> {
    return derived(this.graphStore, (graph) => {
      return Object.values(graph.nodes)
        .filter((node) => {
          return node.signature === "blix.output";
        })
        .reduce((dict, obj) => ({ ...dict, [obj.uuid]: obj }), {});
    });
  }

  public getEdgesReactive() {
    return derived(this.graphStore, (graph) => {
      return Object.values(graph.edges);
    });
  }
}

type GraphDict = { [key: GraphUUID]: GraphStore };

// The public area with all the cool stores 😎
class GraphMall {
  private mall = writable<GraphDict>({});
  private outputNodes = writable<{ [key: GraphNodeUUID]: MediaOutputId }>();

  public refreshGraph(graphUUID: GraphUUID, newGraph: UIGraph) {
    // console.log("REFRESH GRAPH", newGraph)
    this.mall.update((stores) => {
      if (!stores[graphUUID]) {
        stores[graphUUID] = new GraphStore(graphUUID);
      }
      stores[graphUUID].refreshStore(newGraph);

      return stores;
    });

    const val = get(this.mall);
  }

  public refreshGraphUIInputs(graphUUID: GraphUUID, newUIInputs: IGraphUIInputs) {
    this.mall.update((stores) => {
      if (!stores[graphUUID]) {
        stores[graphUUID] = new GraphStore(graphUUID);
      }
      stores[graphUUID].refreshUIInputs(newUIInputs);
      return stores;
    });

    const val = get(this.mall);
  }

  public refreshGraphMetadata(graphUUID: GraphUUID, newMetadata: GraphMetadata) {
    this.mall.update((stores) => {
      if (!stores[graphUUID]) {
        stores[graphUUID] = new GraphStore(graphUUID);
      }
      stores[graphUUID].refreshMetadata(newMetadata);
      return stores;
    });
  }

  public get subscribe() {
    return this.mall.subscribe;
  }

  // Returns a derived store containing only the graph UUIDs
  public getAllGraphUUIDsReactive() {
    return derived(this.mall, (mall) => {
      return Object.keys(mall);
    });
  }

  public getAllGraphUUIDs(): GraphUUID[] {
    return Object.keys(get(this.mall)).map((uuid) => uuid);
  }

  // Returns a derived store containing only the specified graph
  public getGraphReactive(graphUUID: GraphUUID): Readable<GraphStore | null> {
    return derived(this.mall, (mall) => {
      if (!mall[graphUUID]) return null;
      return mall[graphUUID];
    });
  }

  // Returns the store for the specified graph
  public getGraph(graphUUID: GraphUUID) {
    return get(this.mall)[graphUUID];
  }

  // Returns the internal once-off state of the specified graph
  public getGraphState(graphUUID: GraphUUID): UIGraph {
    return get(this.getGraph(graphUUID));
  }

  public getNode(graphUUID: GraphUUID, nodeUUID: GraphNodeUUID): GraphNode {
    return get(get(this.mall)[graphUUID]).nodes[nodeUUID];
  }

  // Update specific graph without updating the mall
  // public updateNode(
  //   graphUUID: GraphUUID,
  //   nodeUUID: GraphNodeUUID,
  //   func: (node: GraphNode) => GraphNode
  // ) {
  //   console.log("UPDATE NODE", graphUUID, nodeUUID);

  //   const currMall = get(this.mall)[graphUUID];
  //   if (!currMall) return;

  //   currMall.update((graph) => {
  //     graph.nodes[nodeUUID] = func(graph.nodes[nodeUUID]);
  //     return graph;
  //   });
  // }

  public onGraphRemoved(graphUUID: GraphUUID) {
    const mallState = get(this.mall);

    if (graphUUID in mallState) {
      this.mall.update((mall) => {
        delete mall[graphUUID];
        return mall;
      });
    }
  }
}

// export const graphMall = writable<GraphMall>(new GraphMall());
export const graphMall = new GraphMall();

/**
 * Writable store used to house the panel that house the last used graph.
 */
export const focusedGraphStore = writable<{ panelId: number; graphUUID: GraphUUID }>({
  panelId: -1,
  graphUUID: "",
});
