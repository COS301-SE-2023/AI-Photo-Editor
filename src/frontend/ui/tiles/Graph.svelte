<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { GraphNode, type GraphEdge } from "@shared/ui/UIGraph";
  import type { UUID } from "@shared/utils/UniqueEntity";
  import { Svelvet, type AnchorKey, type NodeKey } from "blix_svelvet";
  import { onMount, tick } from "svelte";
  import {
    type Writable,
    readable,
    writable,
    type Readable,
    type Unsubscriber,
  } from "svelte/store";
  import { graphMenuStore } from "../../lib/stores/GraphContextMenuStore";
  import { GraphStore, graphMall } from "../../lib/stores/GraphStore";
  import PluginNode from "../utils/graph/PluginNode.svelte";
  // import { onDestroy } from "svelte";
  import { faDiagramProject } from "@fortawesome/free-solid-svg-icons";
  import { onDestroy } from "svelte";
  import Fa from "svelte-fa";
  import { get } from "svelte/store";
  import { fade } from "svelte/transition";
  import type { UIProject } from "../../lib/Project";
  import { commandStore } from "../../lib/stores/CommandStore";
  import { projectsStore } from "../../lib/stores/ProjectStore";
  import type { SelectionBoxItem } from "../../types/selection-box";
  import GraphSelectionBox from "../utils/graph/SelectionBox.svelte";

  // TODO: Abstract panelId to use a generic UUID
  export let panelId = Math.round(10000000.0 * Math.random()).toString();

  let graphId = "";
  let lastGraphsAmount = 0;
  let projectGraphItems: Writable<{ id: string; title: string; timestamp: number }[]> = writable(
    []
  );
  let active = false;
  let project: Readable<UIProject | null> = readable(null);
  let unsubscribe: Unsubscriber;
  /**
   * When component is created, set to active panel
   */
  onMount(() => {
    if ($projectsStore.activeProject) {
      $projectsStore.activeProject.focusedPanel.set(panelId);
      project = projectsStore.getProjectStore($projectsStore.activeProject.id);

      if ($project)
        unsubscribe = $project.focusedGraph.subscribe((graph) => {
          active = graph === graphId && graph !== "";
        });
    }
  });

  $: if ($project) {
    const items: { id: string; title: string; timestamp: number }[] = [];
    const graphIds = $project.graphs;
    for (const id of graphIds) {
      const graphStore = $graphMall[id];
      if (graphStore) {
        const state = get(graphStore);
        items.push({
          id: state.uuid,
          title: state.metadata.displayName,
          timestamp: state.metadata.timestamp,
        });
      }
    }
    items.sort((a, b) => a.timestamp - b.timestamp);
    projectGraphItems.set(items);
  }

  /**
   * Ensure if graph being displayed chnages but active graph doesnt change, we enforce a check
   */
  $: if (graphId) {
    if ($project && get($project.focusedGraph) === graphId) {
      active = true;
    }
  }

  onDestroy(() => {
    unsubscribe();
  });

  // Sets new graph created as the active graph
  $: {
    if ($projectGraphItems.length !== lastGraphsAmount) {
      graphId =
        $projectGraphItems.length > 0 ? $projectGraphItems[$projectGraphItems.length - 1].id : "";
      if ($project) {
        $project.focusedGraph.set(graphId);
      }
    }
    lastGraphsAmount = $projectGraphItems.length;
  }

  let thisGraphStore: Readable<GraphStore | null>;
  let graphNodes: Readable<GraphNode[]>;
  let graphEdges: Readable<GraphEdge[]>;
  let graphData: any;

  // Svelvet graph data
  $: translation = graphData?.transforms?.translation;
  $: zoom = graphData?.transforms?.scale;
  $: dimensions = graphData?.dimensions;

  $: $thisGraphStore?.view?.set({
    translation: $translation,
    dimensions: $dimensions,
    zoom: $zoom,
  });

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

  // Convert a canvas coord to a svelvet coord within the graph
  // function transformPoint(canvasX: number, canvasY: number) {
  //   let x = (canvasX - $translation.x - $dimensions.width / 2) / $zoom + $dimensions.width / 2;
  //   let y = (canvasY - $translation.y - $dimensions.height / 2) / $zoom + $dimensions.height / 2;

  //   return { x, y };
  // }

  // function getGraphCenter() {
  //   return transformPoint($dimensions.width / 2, $dimensions.height / 2);
  // }

  /**
   * When clicking on a graph, set current grapg to be the active graph
   * We dont set the panel aswell, this is set in Panel.svelte where the click event is found
   * @param event
   */
  function handleLeftClick(event: CustomEvent) {
    if ($project && get($project.focusedGraph) !== graphId) $project.focusedGraph.set(graphId);
  }

  function handleRightClick(event: CustomEvent) {
    if ($project && get($project.focusedGraph) !== graphId) $project.focusedGraph.set(graphId);
    // TODO: Fix this at a stage, on initial load context menu does not show
    // unless resize event trigged
    window.dispatchEvent(new Event("resize"));
    // TODO: Add typing to Svelvet for this custom event
    const { cursorPos, canvasPos } = event.detail;
    graphMenuStore.showMenu(cursorPos, canvasPos, graphId);
  }
  /**
   * When a graph is selected in the selection box, make it the active graph
   * to reactively update all other graph tiles
   * @param event
   */
  function handleGraphItemSelection(event: CustomEvent) {
    if ($project) $project.focusedGraph.set(event.detail.id);
  }

  /**
   * Set the graph to be the active panel before adding the graph.
   */
  function handleAddGraph() {
    if ($project) $project.focusedPanel.set(panelId);
    commandStore.runCommand("blix.graphs.create");
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

  function triggerGravity() {
    if (!$thisGraphStore) return;
    $thisGraphStore.gravityDisplace(
      $graphNodes.map((node) => node.uuid),
      10
    );
  }

  async function dataTypeChecker(from: string, to: string) {
    console.log("CHECKING", from, to);
    return await window.apis.typeclassApi.checkTypesCompatible(from, to);
    // return new Promise((resolve) => { return resolve(true) });
  }
</script>

<div class="absolute bottom-[15px] left-[15px] z-[100] flex h-7 items-center space-x-2">
  <div class="flex h-[10px] w-[10px] items-center">
    {#if active}
      <div
        transition:fade|local="{{ duration: 300 }}"
        class="z-1000000 h-full w-full rounded-full border-[1px] border-zinc-600 bg-rose-500"
      ></div>
    {/if}
  </div>
  <div
    class="flex h-7 w-7 items-center justify-center rounded-md border-[1px] border-zinc-600 bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-700"
    title="Undo"
    on:click="{() => $thisGraphStore?.undoChange()}"
    on:keydown="{null}"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="h-5 w-5 stroke-zinc-400"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"></path>
    </svg>
  </div>
  <div
    class="flex h-7 w-7 items-center justify-center rounded-md border-[1px] border-zinc-600 bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-700"
    title="Redo"
    on:click="{() => $thisGraphStore?.redoChange()}"
    on:keydown="{null}"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="h-5 w-5 stroke-zinc-400"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"></path>
    </svg>
  </div>
  <div class="self-end">
    <GraphSelectionBox
      bind:selectedItemId="{graphId}"
      items="{$projectGraphItems}"
      on:editItem="{(event) => updateGraphName(event.detail.newItem)}"
      on:removeItem="{(event) => deleteGraph(event.detail.id)}"
      on:selectItem="{handleGraphItemSelection}"
      missingContentLabel="{'No Graphs'}"
      itemsRemovable="{true}"
    />
  </div>
  <div
    class="flex h-7 w-7 items-center justify-center rounded-md border-[1px] border-zinc-600 bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-700"
    title="Add Graph"
    on:click="{handleAddGraph}"
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
  <button style:float="right" on:click="{triggerGravity}">Gravity</button>
</div> -->
<div
  class="hoverElements flex h-7 select-none items-center justify-center rounded-md border-[1px] border-zinc-600 bg-zinc-800/80 px-1 text-zinc-400 backdrop-blur-md hover:bg-zinc-700 active:bg-zinc-800"
  title="Enable Gravity"
  on:click="{triggerGravity}"
  on:keydown="{null}"
>
  Gravity
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
    zoom="{0.6}"
    minimap
    theme="custom-dark"
    bind:graph="{graphData}"
    on:rightClick="{handleRightClick}"
    on:leftClick="{handleLeftClick}"
    on:connection="{edgeConnected}"
    on:disconnection="{edgeDisconnected}"
    bind:connectAnchorIds="{connectAnchorIds}"
    bind:clearAllGraphEdges="{clearAllGraphEdges}"
    dataTypeChecker="{dataTypeChecker}"
  >
    {#each $graphNodes || [] as node}
      {#key node.uuid}
        <PluginNode panelId="{panelId}" graphId="{graphId}" node="{node}" />
      {/key}
    {/each}

    <!-- Testing graph center -->
    <!-- {#key [$translation, $dimensions]}
    <Node position="{getGraphCenter()}">
        <div class="z-50 text-white">
          {JSON.stringify($translation)}<br />
          {JSON.stringify($zoom)}
        </div>
      </Node>
    {/key} -->
  </Svelvet>
{:else}
  <div class="placeholder select-none">
    <div class="icon"><Fa icon="{faDiagramProject}" style="display: inline-block" /></div>
    <h1>No graphs!</h1>
    <h2>Create a graph to start a workflow</h2>
  </div>
{/if}

<style lang="scss">
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

  .hoverElements {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
  }

  /* .dropdown {
    color: #11111b;
  } */

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    h1 {
      font-size: 1.5em;
      color: #a8a8be;
    }

    .icon {
      width: 100%;
      color: #9090a4;
      font-size: 5em;
      line-height: 1em;
      margin-bottom: 0.1em;
    }

    h2 {
      font-size: 0.8em;
      color: #9090a4;
    }
  }
</style>
