import type { AnchorUUID } from "@electron/lib/core-graph/CoreGraph";
import type { IGraphUIInputs, INodeUIInputs, UIInputChange } from "@shared/types/graph";
import type { NodeSignature } from "@shared/ui/ToolboxTypes";
import {
  UIGraph,
  GraphNode,
  type GraphNodeUUID,
  type GraphUUID,
  type SvelvetCanvasPos,
  constructUIValueStore,
  type GraphMetadata,
  NodeStylingStore,
} from "@shared/ui/UIGraph";
import { writable, get, derived, type Writable, type Readable } from "svelte/store";
import { toolboxStore } from "./ToolboxStore";
import type { MediaOutputId } from "@shared/types/media";
import { tick } from "svelte";
import type { UUID } from "@shared/utils/UniqueEntity";

// import type { Connections } from "blix_svelvet";
// type Connections = (string | number | [string | number, string | number] | null)[];

// TODO: Return a GraphStore in createGraphStore for typing
export type GraphView = {
  translation: { x: number; y: number };
  dimensions: { width: number; height: number };
  zoom: number;
};
export class GraphStore {
  view: Writable<GraphView>;
  graphStore: Writable<UIGraph>;
  uiInputUnsubscribers: { [key: GraphNodeUUID]: (() => void)[] } = {};
  uiInputSubscribers: { [key: GraphNodeUUID]: () => void } = {};
  uiPositionUnsubscribers: { [key: GraphNodeUUID]: (() => void)[] } = {};
  uiPositionSubscribers: { [key: GraphNodeUUID]: () => void } = {};

  constructor(public uuid: GraphUUID) {
    // Starts with empty graph
    this.graphStore = writable<UIGraph>(new UIGraph(uuid));
    this.view = writable<GraphView>();
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
      const oldPositions = graph.uiPositions;
      graph.nodes = newGraph.nodes;

      for (const node of Object.keys(graph.nodes)) {
        if (oldNodes[node]) {
          // Node carried over from old graph, maintain its styling / UI inputs
          graph.nodes[node].styling = oldNodes[node].styling;
          // graph.nodes[node].styling.pos =
          graph.nodes[node].inputUIValues = oldNodes[node].inputUIValues;
          graph.uiPositions[node] = oldPositions[node];
        } else {
          // If node has a UI input, create a store and subscribe to it
          const toolboxNode = toolboxStore.getNode(graph.nodes[node].signature);
          graph.nodes[node].styling = new NodeStylingStore();
          // console.log(newGraph.uiPositions[node])
          graph.nodes[node].styling!.pos.set(newGraph.uiPositions[node]);

          graph.uiPositions[node] = newGraph.uiPositions[node];

          if (toolboxNode.ui) {
            graph.nodes[node].inputUIValues = constructUIValueStore(
              toolboxNode.ui,
              toolboxNode.uiConfigs
            );

            const inputs = graph.nodes[node].inputUIValues.inputs;
            // TODO: Investigate this; for some reason not all the keys in `inputs`
            //       are available off the bat unless you wait for the next tick()
            const position = graph.nodes[node].styling?.pos;
            tick()
              .then(() => {
                this.uiPositionUnsubscribers[node] = [];
                this.uiInputUnsubscribers[node] = [];

                for (const input in inputs) {
                  if (!inputs.hasOwnProperty(input)) continue;

                  this.uiInputUnsubscribers[node].push(
                    inputs[input].subscribe((state) => {
                      this.globalizeUIInputs(node, input).catch((err) => {
                        return;
                      });
                    })
                  );
                }

                // Update frontend
                if (position)
                  this.uiPositionUnsubscribers[node].push(
                    position.subscribe((state) => {
                      this.updateUIPosition(node, state);
                    })
                  );
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
        if (!graph.nodes[node] && this.uiPositionUnsubscribers[node]) {
          delete this.uiPositionUnsubscribers[node];
        }
      }

      return graph;
    });
  }

  async undoChange() {
    const res = await window.apis.graphApi.undoChange(get(this.graphStore).uuid);
  }

  async redoChange() {
    const res = await window.apis.graphApi.redoChange(get(this.graphStore).uuid);
  }

  async addNode(nodeSignature: NodeSignature, pos: SvelvetCanvasPos) {
    const thisUUID = get(this.graphStore).uuid;
    const res = await window.apis.graphApi.addNode(thisUUID, nodeSignature, pos);

    // if (pos) {
    //   console.log("SET NODE POS", pos);
    //   const posRes = await window.apis.graphApi.setNodePos(thisUUID, res, pos);
    // }

    return res.status;
  }

  async handleNodeInputInteraction(graphUUID: UUID, nodeUUID: UUID, input: UIInputChange) {
    // console.log("INPUT: ", input.value)
    const res = await window.apis.graphApi.handleNodeInputInteraction(graphUUID, nodeUUID, input);
    // console.log(res);
  }

  async addEdge(anchorA: AnchorUUID, anchorB: AnchorUUID) {
    const thisUUID = get(this.graphStore).uuid;
    const res = await window.apis.graphApi.addEdge(thisUUID, anchorA, anchorB);

    return res.status;
  }

  // Linked once to each UI input as a store subscriber.
  // Notifies the backend of the frontend store changing.
  async globalizeUIInputs(nodeUUID: GraphNodeUUID, inputId: string) {
    const thisUUID = get(this.graphStore).uuid;
    const res = await window.apis.graphApi.updateUIInputs(
      thisUUID,
      nodeUUID,
      this.getNodeUiInputs(nodeUUID, inputId)
    );
    // Notify our UI subscribers
  }

  getNodeUiInputs(nodeUUID: UUID, inputId: string) {
    const node = get(this.graphStore).nodes[nodeUUID];
    const nodeInputs = node.inputUIValues;
    const inputs: INodeUIInputs = { inputs: {}, changes: [inputId] };

    for (const input of Object.keys(nodeInputs.inputs)) {
      inputs.inputs[input] = get(nodeInputs.inputs[input]);
    }
    return inputs;
  }

  // Update the store value of a specific UI input
  updateUIInput(nodeUUID: GraphNodeUUID, inputId: string, value: unknown) {
    const node = this.getNode(nodeUUID);
    if (node) {
      node.inputUIValues.inputs[inputId].set(value);
    }
  }

  updateUIPosition(nodeUUID: UUID, position: SvelvetCanvasPos) {
    // console.log("HERE", get(this.graphStore).uiPositions)
    this.graphStore.update((graph) => {
      graph.uiPositions[nodeUUID] = position;
      return graph;
    });
    // await window.apis.graphApi.updateUIPosition(get(this.graphStore).uuid, nodeUUID, get(get(this.graphStore).uiPositions[nodeUUID]));
  }

  /**
   * BE CAREFUL OF THE UNAWAITED PROMISE
   * AWAIT REMOVED FOR UP DAY AS A TEMP FIX
   */
  async updateUIPositions() {
    // eslint-disable-next-line
    await window.apis.graphApi.updateUIPositions(
      get(this.graphStore).uuid,
      get(this.graphStore).uiPositions
    );
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

  public getNodes() {
    return get(this.graphStore).nodes;
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

  public gravityDisplace(nodes: GraphNodeUUID[], duration: number) {
    const start = performance.now();

    const nodesSet = new Set(nodes);
    const FORCE = 3;
    const NUDGE_DISTANCE = 10;

    // ===== NUDGE NODES RANDOMLY ===== //
    nodes.forEach((node) => {
      const nodePos = this.getNode(node)?.styling?.pos;
      if (!nodePos) return;
      nodePos.update((pos) => {
        return {
          x: pos.x + NUDGE_DISTANCE * 2 * (Math.random() - 0.5),
          y: pos.y + NUDGE_DISTANCE * 2 * (Math.random() - 0.5),
        };
      });
    });

    // Notify the system of the new node positions
    const registerPositionUpdate = async () => {
      await this.updateUIPositions();
      return; // TODO
    };

    const tickGravityDisplace = () => {
      const now = performance.now();
      if (now - start > duration * 1000) {
        // Animation is done
        void registerPositionUpdate().then().catch();
        return;
      }

      const forces: { [key: GraphNodeUUID]: { x: number; y: number } } = {};

      // ===== COMPUTE CENTER OF MASS ===== //
      const centerMass = { x: 0, y: 0 };
      const CENTER_FORCE = 0.02;
      let numNodes = 0;
      nodes.forEach((node) => {
        const nodePos = this.getNode(node)?.styling?.pos;
        if (!nodePos) return;

        const nodePosVal = get(nodePos);

        centerMass.x += nodePosVal.x;
        centerMass.y += nodePosVal.y;
        numNodes++;
      });
      centerMass.x /= numNodes;
      centerMass.y /= numNodes;

      nodes.forEach((node) => {
        if (!forces[node]) forces[node] = { x: 0, y: 0 };
      });

      // ===== ADD EDGE DIRECTION REPULSION FORCES ===== //

      const totalDirForce = 0;
      // let totalDirForce = 0;
      // const dirForces: { [key: GraphNodeUUID]: number } = {};
      // const DIRECTION_FORCE = 5;
      // const MAX_DIRECTION_FORCE = 800;

      // const edges = get(this.graphStore).edges;
      // Object.keys(edges).forEach((edge) => {
      //   const edgeObj = edges[edge];

      //   // Add leftward force
      //   if (nodesSet.has(edgeObj.nodeUUIDFrom)) {
      //     dirForces[edgeObj.nodeUUIDFrom] = -DIRECTION_FORCE;
      //   }

      //   // Add rightward force
      //   if (nodesSet.has(edgeObj.nodeUUIDTo)) {
      //     dirForces[edgeObj.nodeUUIDTo] = DIRECTION_FORCE;
      //   }
      // });

      // nodes.forEach((node) => {
      //   if (!dirForces[node]) dirForces[node] = 0;

      //   dirForces[node] = Math.max(
      //     Math.min(dirForces[node], MAX_DIRECTION_FORCE),
      //     -MAX_DIRECTION_FORCE
      //   );
      //   totalDirForce += dirForces[node];

      //   forces[node].x += dirForces[node];
      // });
      // totalDirForce /= numNodes;

      // ===== ADD CENTER OF MASS ATTRACTION FORCE + COUNTERBALANCE DIRECTION FORCE ===== //
      nodes.forEach((node) => {
        const nodePos = this.getNode(node)?.styling?.pos;
        if (!nodePos) return;

        const nodePosVal = get(nodePos);

        const diff = { x: centerMass.x - nodePosVal.x, y: centerMass.y - nodePosVal.y };
        const dist = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
        const forceMag = dist * CENTER_FORCE;

        if (diff.x !== 0 || diff.y !== 0) {
          forces[node].x += (diff.x / dist) * forceMag - totalDirForce;
          forces[node].y += (diff.y / dist) * forceMag;
        }
      });

      // ===== ADD INTER-NODE REPULSION FORCES ===== //
      const NODE_FORCE = 3;
      const VERTICAL_SQUASH = 0.75;
      nodes.forEach((node) => {
        const nodePos = this.getNode(node)?.styling?.pos;
        if (!nodePos) return;

        const nodePosVal = get(nodePos);
        const nodeForce = { x: 0, y: 0 };

        nodes.forEach((otherNode) => {
          if (node === otherNode) return;

          const otherNodePos = this.getNode(otherNode)?.styling?.pos;
          if (!otherNodePos) return;

          const otherNodePosVal = get(otherNodePos);
          const diff = {
            x: nodePosVal.x - otherNodePosVal.x,
            y: nodePosVal.y - otherNodePosVal.y,
          };
          const dist = Math.sqrt(diff.x * diff.x + diff.y * diff.y);

          if (diff.x !== 0) nodeForce.x += (NODE_FORCE * diff.x) / dist;

          if (diff.y !== 0) nodeForce.y += (NODE_FORCE * diff.y * VERTICAL_SQUASH) / dist;
        });

        forces[node].x += nodeForce.x;
        forces[node].y += nodeForce.y;
      });

      // ===== APPLY FORCES ===== //
      nodes.forEach((node) => {
        const nodePos = this.getNode(node)?.styling?.pos;
        if (!nodePos) return;

        nodePos.update((pos) => {
          return {
            x: pos.x + forces[node].x * FORCE,
            y: pos.y + forces[node].y * FORCE,
          };
        });
      });

      requestAnimationFrame(tickGravityDisplace);
    };

    tickGravityDisplace();
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

  public async clearAllGraphs() {
    this.mall.set({});
    this.outputNodes.set({});
    await window.apis.graphApi.clearAllGraphs();
  }
}

// export const graphMall = writable<GraphMall>(new GraphMall());
export const graphMall = new GraphMall();
