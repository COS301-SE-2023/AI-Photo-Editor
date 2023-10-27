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
  GraphEdge,
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

  public discernNodeLayers(nodes: GraphNodeUUID[]) {
    // Get all edges between chosen nodes
    const edges: GraphEdge[] = Object.values(get(this.graphStore).edges).filter(
      (e) => nodes.includes(e.nodeUUIDFrom) && nodes.includes(e.nodeUUIDTo)
    );

    // Construct edge mapping { [toNode]: fromNode[] }
    const edgeMap: { [key: GraphNodeUUID]: { fromNode: GraphNodeUUID; toAnchor: string }[] } = {};
    edges.forEach((edge) => {
      if (edgeMap[edge.nodeUUIDTo] == null) {
        edgeMap[edge.nodeUUIDTo] = [];
      }
      edgeMap[edge.nodeUUIDTo].push({ fromNode: edge.nodeUUIDFrom, toAnchor: edge.anchorIdTo });
    });
    // Sort edgeMap according to anchor order in node
    // TODO: OPTIMIZE THIS!
    Object.keys(edgeMap).forEach((nodeTo) => {
      const signature = this.getNode(nodeTo).signature;
      edgeMap[nodeTo] = edgeMap[nodeTo].sort((a, b) => {
        const indexA = toolboxStore.getAnchorOrderedIndex(signature, a.toAnchor);
        const indexB = toolboxStore.getAnchorOrderedIndex(signature, b.toAnchor);
        return indexA - indexB;
      });
    });

    // Find output nodes
    const fromNodes = new Set(edges.map((e) => e.nodeUUIDFrom));
    const outputNodes = new Set(nodes.filter((n) => !fromNodes.has(n)));

    // Setup for depth-first search
    const layersByOutput: { [key: GraphNodeUUID]: { [key: GraphNodeUUID]: number } } = {}; // { [outputNode]: { [node]: layerNo } }

    function dfs(node: GraphNodeUUID, layers: { [key: GraphNodeUUID]: number }, d: number) {
      if (edgeMap[node] == null) return d;

      let maxD = d;
      edgeMap[node].forEach(({ fromNode }) => {
        if (!layers[fromNode] || layers[fromNode] < d + 1) {
          layers[fromNode] = d + 1;
          maxD = Math.max(maxD, dfs(fromNode, layers, d + 1));
        }
      });

      return maxD;
    }

    // Traverse for layers
    const maxDs: { [key: GraphNodeUUID]: number } = {}; // { [outputNode]: maxD }
    let maxMaxD = 0;

    outputNodes.forEach((out) => {
      layersByOutput[out] = { [out]: 0 };

      maxDs[out] = dfs(out, layersByOutput[out], 0);
      maxMaxD = Math.max(maxMaxD, maxDs[out]);
    });

    // Zip merge columns
    const merged: { [key: number]: Set<GraphNodeUUID> } = {};

    outputNodes.forEach((out) => {
      for (const [n, l] of Object.entries(layersByOutput[out])) {
        const i = maxMaxD - (maxDs[out] - l);

        if (merged[i] == null) {
          merged[i] = new Set();
        }

        if (!merged[i].has(n)) {
          merged[i].add(n);
        }
      }
    });

    return { layers: merged, numLayers: maxMaxD + 1, edgeMap };
  }

  public gravityDisplace(nodes: GraphNodeUUID[], duration: number) {
    const start = performance.now();

    const FORCE = 3;
    const NUDGE_DISTANCE = 10;

    const X_SNAP_POS = 500;
    const X_SNAP_FORCE = 0.2;
    const Y_SPLAYING_FORCE = 400;

    const CENTER_FORCE = 0.02;

    const EDGE_TIGHTEN_FORCE = 0.1;

    const NODE_FORCE = 15;

    // ===== DISCERN + APPLY NODE LAYERS ===== //
    const { layers, numLayers, edgeMap } = this.discernNodeLayers(nodes);

    // Obtain center x pos
    let centerX = 0;
    let numNodes = 0;
    nodes.forEach((node) => {
      const nodePos = this.getNode(node)?.styling?.pos;
      if (!nodePos) return;

      centerX += get(nodePos).x;
      numNodes++;
    });
    centerX /= numNodes;

    // Apply initial (layered) placement
    for (const [layer, layerNodes] of Object.entries(layers)) {
      layerNodes.forEach((node) => {
        const nodePos = this.getNode(node)?.styling?.pos;
        if (!nodePos) return;

        nodePos.update((pos) => {
          return {
            x: centerX + X_SNAP_POS * (numLayers / 2 - parseFloat(layer)),
            y: pos.y + NUDGE_DISTANCE * 2 * (Math.random() - 0.5), // Random nudge
          };
        });
      });
    }

    // Notify the system of the new node positions
    const registerPositionUpdate = async () => {
      await this.updateUIPositions();
    };

    // ========== MAIN LOOP ========== //
    const tickGravityDisplace = () => {
      const now = performance.now();
      if (now - start > duration * 1000) {
        // Animation is done
        void registerPositionUpdate().then().catch();
        return;
      }

      // ===== INITIALIZE FORCES ===== //
      const forces: { [key: GraphNodeUUID]: { x: number; y: number } } = {};

      nodes.forEach((node) => {
        forces[node] = { x: 0, y: 0 };
      });

      // ===== COMPUTE VERTICAL CENTER OF MASS ===== //
      let centerMassV = 0;
      nodes.forEach((node) => {
        const nodePos = this.getNode(node)?.styling?.pos;
        if (!nodePos) return;

        const nodePosVal = get(nodePos);

        centerMassV += nodePosVal.y;
      });
      centerMassV /= numNodes;

      // ===== COMPUTE HORIZONTAL SNAPPING + APPLY CENTER OF MASS ===== //
      nodes.forEach((node) => {
        const nodePos = this.getNode(node)?.styling?.pos;
        if (!nodePos) return;

        const nodePosVal = get(nodePos);
        const snapPoint = Math.round(nodePosVal.x / (0.5 * X_SNAP_POS)) * (0.5 * X_SNAP_POS);
        const diff = snapPoint - nodePosVal.x;

        // TODO: Check if snap point is a different layer from layerNodes
        // then update layerNodes if necessary

        // forces[node].x += diff * X_SNAP_FORCE;
        forces[node].y += (centerMassV - nodePosVal.y) * CENTER_FORCE;
      });

      // ===== ADD EDGE TIGHTENING FORCES ===== //
      for (const layer in layers) {
        if (!layers.hasOwnProperty(layer) || parseInt(layer, 10) === numLayers) continue;

        layers[layer].forEach((node) => {
          if (edgeMap[node] == null) return;

          const nodePos = this.getNode(node)?.styling?.pos;
          if (!nodePos) return;

          const nodePosVal = get(nodePos);

          edgeMap[node].forEach(({ fromNode }, i) => {
            const fromNodePos = this.getNode(fromNode)?.styling?.pos;
            if (!fromNodePos) return;

            const fromNodePosVal = get(fromNodePos);
            const diff = {
              x: nodePosVal.x - X_SNAP_POS - fromNodePosVal.x,
              y:
                nodePosVal.y + (i - edgeMap[node].length / 2) * Y_SPLAYING_FORCE - fromNodePosVal.y,
            };

            // forces[fromNode].x += EDGE_TIGHTEN_FORCE * diff.x;
            forces[fromNode].y += EDGE_TIGHTEN_FORCE * diff.y; // Math.sign(diffY) * diffY;
          });
        });
      }

      // ===== ADD INTER-NODE REPULSION FORCES WITHIN LAYER ===== //
      for (const layerNodes of Object.values(layers)) {
        layerNodes.forEach((node) => {
          const nodePos = this.getNode(node)?.styling?.pos;
          const nodeHeight = this.getNode(node)?.styling?.height;

          if (!nodePos || !nodeHeight) return;

          const nodePosVal = get(nodePos);
          const nodeHeightVal = get(nodeHeight);

          layerNodes.forEach((otherNode) => {
            if (node === otherNode) return;

            const otherNodePos = this.getNode(otherNode)?.styling?.pos;
            const otherNodeHeight = this.getNode(otherNode)?.styling?.height;
            if (!otherNodePos || !otherNodeHeight) return;

            const otherNodePosVal = get(otherNodePos);
            const otherNodeHeightVal = get(otherNodeHeight);
            const diff = {
              x: nodePosVal.x - otherNodePosVal.x,
              y: nodePosVal.y - otherNodePosVal.y,
            };

            let multiplier = NODE_FORCE;

            // Check nodes not overlapping
            if (
              nodePosVal.y > otherNodePosVal.y
                ? nodePosVal.y < otherNodePosVal.y + nodeHeightVal
                : nodePosVal.y + nodeHeightVal > otherNodePosVal.y
            ) {
              multiplier *= 4;
            }

            // const dist = diff.x * diff.x + diff.y * diff.y;
            // forces[node].x += 1000000 * NODE_FORCE * Math.sign(diff.x) / dist;
            // forces[node].y += 1000000 * NODE_FORCE * Math.sign(diff.y) / dist;

            // Applied force is simply a linear constant to counterbalance center force
            forces[node].y += NODE_FORCE * Math.sign(diff.y);
          });
        });
      }

      // ===== COMPUTE GLOBAL COUNTERBALANCE ===== //
      const counterbalance = { x: 0, y: 0 };
      nodes.forEach((node) => {
        counterbalance.x += forces[node].x;
        counterbalance.y += forces[node].y;
      });
      counterbalance.x /= nodes.length;
      counterbalance.y /= nodes.length;

      // ===== APPLY FORCES ===== //
      nodes.forEach((node) => {
        const nodePos = this.getNode(node)?.styling?.pos;
        if (!nodePos) return;

        nodePos.update((pos) => {
          return {
            x: pos.x + (forces[node].x - counterbalance.x) * FORCE,
            y: pos.y + (forces[node].y - counterbalance.y) * FORCE,
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
