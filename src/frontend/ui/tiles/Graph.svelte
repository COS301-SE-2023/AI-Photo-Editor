<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet } from "blix_svelvet";
  import { type Readable } from "svelte/store";
  import { GraphStore, graphMall } from "../../lib/stores/GraphStore";
  import PluginNode from "../utils/graph/PluginNode.svelte";
  import { projectsStore } from "lib/stores/ProjectStore";
  import { graphNodeMenuStore, type ContextMenuState } from "../../lib/stores/ContextMenuStore";
  // TODO: Abstract panelId to use a generic UUID
  // export let panelId = 0;
  export let panelId = Math.round(10000000.0 * Math.random()).toString();

  let graphIds = projectsStore.activeProjectGraphIds;
  // let graphIds = graphMall.getAllGraphUUIDsReactive();
  let graphId = $graphIds[0];

  let thisGraphStore: Readable<GraphStore | null>;
  let graphNodes: Readable<any[]>;

  let graphData: any;

  // Svelvet graph data
  $: translation = graphData?.transforms?.translation;
  $: zoom = graphData?.transforms?.scale;
  $: dimensions = graphData?.dimensions;

  function updateOnGraphId(graphId: string) {
    thisGraphStore = graphMall.getGraphReactive(graphId);
    if ($thisGraphStore) {
      graphNodes = $thisGraphStore.getNodesReactive();
    }
  }

  // Only updates when _graphId_ changes
  $: updateOnGraphId(graphId);

  // function edgeDropped(...e: any) {
  //   console.log(e);
  // }

  function addNode() {
    $thisGraphStore?.addNode("hello-plugin.hello", getGraphCenter());
    // $thisGraphStore?.addNode();
  }

  function getGraphCenter() {
    return {
      x: $dimensions.width / 2 - $translation.x / $zoom,
      y: $dimensions.height / 2 - $translation.y / $zoom,
    };
  }

  function handleLeftClick() {
    console.log("Left Click");
    graphNodeMenuStore.hideMenu();
  }

  function handleRightClick(event: CustomEvent) {
    console.log("Right Click");

    const state: ContextMenuState = {
      isShowing: true,
      items: [],
      windowPos: event.detail.windowPos,
      canvasPos: event.detail.canvasPos,
    };
    graphNodeMenuStore.showMenu(state);
    console.log("Hi ", state);
  }

  // $: console.log("GRAPH MALL UPDATED", $graphMall);
</script>

<div class="hoverElements">
  <button on:click="{addNode}">Add Node</button>
  <select name="graphPicker" class="dropdown" bind:value="{graphId}">
    {#each $graphIds as id}
      <option value="{id}">{id.slice(0, 8)}</option>
    {/each}
  </select>
</div>

{#if thisGraphStore}
  <Svelvet
    id="{panelId}-{graphId}"
    zoom="{0.7}"
    minimap
    theme="custom-dark"
    bind:graph="{graphData}"
    on:LeftClick="{handleLeftClick}"
    on:RightClick="{handleRightClick}"
  >
    {#each $graphNodes || [] as node}
      {#key node}
        <PluginNode panelId="{panelId}" graphId="{graphId}" node="{node}" />
      {/key}
    {/each}

    <!-- Testing graph center -->
    {#key [$translation, $dimensions]}
      <!-- <Node position="{getGraphCenter()}">
        <div class="z-50 text-white">
          {JSON.stringify($translation)}<br />
          {JSON.stringify($zoom)}
        </div>
      </Node> -->
    {/key}
  </Svelvet>
{:else}
  <div>Graph store not found</div>
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

  .hoverElements {
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 100;
  }

  .dropdown {
    color: #11111b;
  }
</style>
