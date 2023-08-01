<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet, type NodeKey, type AnchorKey } from "blix_svelvet";
  import { derived, type Readable } from "svelte/store";
  import { GraphStore, graphMall, focusedGraphStore } from "../../lib/stores/GraphStore";
  import PluginNode from "../utils/graph/PluginNode.svelte";
  import { graphMenuStore } from "../../lib/stores/GraphContextMenuStore";
  import type { UUID } from "@shared/utils/UniqueEntity";
  import { GraphNode, type GraphEdge } from "@shared/ui/UIGraph";
  import { tick } from "svelte";
  import { focusedPanelStore } from "../../lib/PanelNode";
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import { commandStore } from "../../lib/stores/CommandStore";
  import GraphSelectionBox from "../utils/graph/SelectionBox.svelte";
  import { projectsStore } from "../../lib/stores/ProjectStore";
  import { get } from "svelte/store";
  import type { SelectionBoxItem } from "../../types/selection-box";
  // import { type Anchor } from "blix_svelvet/dist/types"; // TODO: Use to createEdge

  // TODO: Abstract panelId to use a generic UUID
  // export let panelId = 0;
  export let panelId = Math.round(10000000.0 * Math.random());

  let graphId = "";
  let lastGraphsAmount = 0;

  const projectGraphItems = derived([projectsStore, graphMall], ([$projectsStore, $graphMall]) => {
    if (!$projectsStore.activeProject) {
      return [];
    }

    const items: { id: string; title: string }[] = [];
    const graphIds = $projectsStore.activeProject.graphs;

    for (graphId of graphIds) {
      const graphStore = $graphMall[graphId];
      if (graphStore) {
        const state = get(graphStore);
        items.push({
          id: state.uuid,
          title: state.metadata.displayName,
        });
      }
    }

    return items;
  });

  // Makes sure that the active graph id is always set correctly
  $: focusedGraphStore.set({ panelId, graphUUID: graphId });

  // Sets new graph created as the active graph
  $: {
    const items = $projectGraphItems;
    if (items.length > lastGraphsAmount && $focusedPanelStore === panelId) {
      graphId = items[items.length - 1].id;
    }
    lastGraphsAmount = items.length;
  }

  /**
   * When a new panel is focussed on (the panel is clicked),
   * the focusedPanelStore is updated through Panel.svelte. If the panel clicked is the panel
   * that houses the current graph, the store holidng the last graph is set to the current graph.
   *
   * If a user clicks off onto a panel that does not house a graph, the last focussed graph will retain its
   * indicator as the indicator subscribes to the value of the focusedGraphStore, no the focusedPanelStore.
   */
  const unsubscribe = focusedPanelStore.subscribe((state) => {
    if (panelId === state) {
      focusedGraphStore.set({ panelId: panelId, graphUUID: graphId });
    }
  });

  onDestroy(() => {
    unsubscribe();
  });

  let thisGraphStore: Readable<GraphStore | null>;
  let graphNodes: Readable<GraphNode[]>;
  let graphEdges: Readable<GraphEdge[]>;
  let graphData: any;

  // Svelvet graph data
  $: translation = graphData?.transforms?.translation;
  $: zoom = graphData?.transforms?.scale;
  $: dimensions = graphData?.dimensions;

  // Hooks exposed by <Svelvet />
  let connectAnchorIds: (
    sourceNode: NodeKey,
    sourceAnchor: AnchorKey,
    targetNode: NodeKey,
    targetAnchor: AnchorKey
  ) => boolean;
  let clearAllGraphEdges: () => void;

  // Swap out the graph when the user makes a selection in the dropdown
  function updateOnGraphId(graphId: string) {
    thisGraphStore = graphMall.getGraphReactive(graphId);
    if ($thisGraphStore) {
      graphNodes = $thisGraphStore.getNodesReactive();
      graphEdges = $thisGraphStore.getEdgesReactive();
      updateOnGraphEdges($graphEdges);
    }
  }

  async function updateOnGraphEdges(edges: GraphEdge[]) {
    // When the tile first loads, `clearAllGraphEdges` and `connectAnchorIds`
    // only work after the tick - when the new graph anchors have been created
    await tick();
    if (clearAllGraphEdges) clearAllGraphEdges();

    for (let edge in edges) {
      if (!edges.hasOwnProperty(edge)) continue;
      const edgeData = edges[edge];

      // Skip if nodes don't exist
      // const fromNode = $graphNodes.find(node => node.id === edgeData.nodeFrom)
      // const toNode   = $graphNodes.find(node => node.id === edgeData.nodeTo);
      // if (!fromNode || !toNode) continue;

      if (connectAnchorIds) {
        // TODO: Handle if this fails
        const res = connectAnchorIds(
          `N-${panelId}_${edgeData.nodeUUIDFrom}`,
          // E.g. A-4_in2/N-4_IxExhIof-npSfn0dnO-VRSW4_kqn2z5bcCPCcflY_MA
          `A-${panelId}_${edgeData.anchorIdFrom}`,
          `N-${panelId}_${edgeData.nodeUUIDTo}`,
          `A-${panelId}_${edgeData.anchorIdTo}`
        );
      }
    }
  }

  $: updateOnGraphEdges($graphEdges);

  // Only updates when _graphId_ changes
  $: updateOnGraphId(graphId);

  function getGraphCenter() {
    return {
      x: $dimensions.width / 2 - $translation.x / $zoom,
      y: $dimensions.height / 2 - $translation.y / $zoom,
    };
  }

  function handleRightClick(event: CustomEvent) {
    // TODO: Fix this at a stage, on initial load context menu does not show
    // unless resize event trigged
    window.dispatchEvent(new Event("resize"));
    // TODO: Add typing to Svelvet for this custom event
    const { cursorPos, canvasPos } = event.detail;
    graphMenuStore.showMenu(cursorPos, canvasPos, graphId);
  }

  // $: console.log("GRAPH MALL UPDATED", $graphMall);
  // Svelvet id's are of the following format:
  // <panelId>_<anchorId>/<panelId>_<nodeUUID>
  // Entities include nodes and anchors
  async function splitCompositeAnchorId(
    entityId: string
  ): Promise<{ anchorUUID: UUID; nodeUUID: UUID } | null> {
    if (!$thisGraphStore) return null;
    try {
      const [anchorKey, nodeKye] = entityId.split("/");

      const [_1, anchorId] = anchorKey.split("_");
      const [_2, ...nodeUUIDParts] = nodeKye.split("_");
      const nodeUUID = nodeUUIDParts.join("_");

      // removing console logs + commit + merge <=====================================
      // console.log("NODE", $thisGraphStore.getNode(nodeUUID));
      await tick();
      const anchorUUID = $thisGraphStore.getNode(nodeUUID)
        ? $thisGraphStore.getNode(nodeUUID).anchorUUIDs[anchorId]
        : null;

      if (!anchorUUID || !nodeUUID) return null;
      return { anchorUUID, nodeUUID };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function edgeConnected(e: CustomEvent<any>) {
    console.log("CONNECTION EVENT");
    if (!$thisGraphStore) return;
    const fromAnchor = await splitCompositeAnchorId(e.detail.sourceAnchor.id);
    const toAnchor = await splitCompositeAnchorId(e.detail.targetAnchor.id);

    if (!fromAnchor || !toAnchor) return;
    $thisGraphStore?.addEdge(fromAnchor.anchorUUID, toAnchor.anchorUUID);
  }

  async function edgeDisconnected(e: CustomEvent<any>) {
    console.log("DISCONNECTION EVENT");
    const toUUID = await splitCompositeAnchorId(e.detail.targetAnchor.id);

    if (!toUUID) return;
    console.log("DISCONNECTING", toUUID);

    $thisGraphStore?.removeEdge(toUUID.anchorUUID);
  }

  function updateGraphName(newItem: SelectionBoxItem) {
    const { id, title } = newItem;
    window.apis.graphApi.updateGraphMetadata(id, { displayName: title });
  }

  function deleteGraph(id: string) {
    commandStore.runCommand("blix.graphs.deleteGraph", { id });
  }
</script>

<div class="absolute bottom-[15px] left-[15px] z-[100] flex h-7 items-center space-x-2">
  <div class="flex h-[10px] w-[10px] items-center">
    {#if panelId === $focusedGraphStore.panelId}
      <div
        transition:fade="{{ duration: 300 }}"
        class="z-1000000 h-full w-full rounded-full border-[1px] border-zinc-600 bg-rose-500"
      ></div>
    {/if}
  </div>
  <div class="self-end">
    <GraphSelectionBox
      bind:selectedItemId="{graphId}"
      items="{$projectGraphItems}"
      on:editItem="{(event) => updateGraphName(event.detail.newItem)}"
      on:removeItem="{(event) => deleteGraph(event.detail.id)}"
      missingContentLabel="{'No Graphs'}"
      itemsRemovable="{true}"
    />
  </div>
  <div
    class="flex h-7 w-7 items-center justify-center rounded-md border-[1px] border-zinc-600 bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-700"
    title="Add Graph"
    on:click="{() => commandStore.runCommand('blix.graphs.create')}"
    on:keydown="{null}"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="h-6 w-6 stroke-zinc-400"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path>
    </svg>
  </div>
</div>

<!-- <div class="hoverElements">
  <div class="mr-2 inline-block h-[10px] w-[10px]">
    {#if panelId === $focusedGraphStore.panelId}
      <div
        transition:fade="{{ duration: 300 }}"
        class="z-1000000 h-full w-full rounded-full border-[1px] border-rose-700 bg-rose-500"
      ></div>
    {/if}
  </div>
  <div class="inline-block">
    <GraphSelectionBox />
  </div>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="mb-2 inline-block h-6 w-6 rounded-md stroke-zinc-200 hover:bg-zinc-700"
    on:click="{() => commandStore.runCommand('blix.graphs.create')}"
    on:keydown="{null}"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path>
  </svg>

  <button style:float="right" on:click={addRandomConn}>Add random conn</button>
  <button style:float="right" on:click={clearEdges}>Clear edges</button>
</div> -->

{#if thisGraphStore && $thisGraphStore}
  <Svelvet
    id="{panelId}-{graphId}"
    zoom="{0.7}"
    minimap
    theme="custom-dark"
    bind:graph="{graphData}"
    on:rightClick="{handleRightClick}"
    on:connection="{edgeConnected}"
    on:disconnection="{edgeDisconnected}"
    bind:connectAnchorIds="{connectAnchorIds}"
    bind:clearAllGraphEdges="{clearAllGraphEdges}"
  >
    {#each $graphNodes || [] as node}
      {#key node.uuid}
        <PluginNode panelId="{panelId}" graphId="{graphId}" node="{node}" />
      {/key}
    {/each}

    <!-- Testing graph center -->
    <!-- {#key [$translation, $dimensions]} -->
    <!-- <Node position="{getGraphCenter()}">
        <div class="z-50 text-white">
          {JSON.stringify($translation)}<br />
          {JSON.stringify($zoom)}
        </div>
      </Node> -->
    <!-- {/key} -->
  </Svelvet>
{:else}
  <div class="flex h-full w-full items-center justify-center text-xl text-zinc-400">No graphs</div>
{/if}

<style>
  :root[svelvet-theme="custom-dark"] {
    --background-color: #181825;
    --dot-color: hsl(225, 10%, 50%);

    --minimap-background-color: #52525b;

    --minimap-node-color: hsl(225, 30%, 20%);

    --controls-background-color: hsl(225, 20%, 27%);
    --controls-text-color: hsl(0, 0%, 100%);

    --theme-toggle-text-color: hsl(0, 0%, 100%);
    --theme-toggle-color: hsl(225, 20%, 27%);
  }

  /* .hoverElements {
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 100;
  }

  .dropdown {
    color: #11111b;
  } */
</style>
