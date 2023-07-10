<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet } from "svelvet";
  import { type Readable } from "svelte/store";
  import { GraphStore, graphMall } from "lib/stores/GraphStore";
  import PluginNode from "../utils/graph/PluginNode.svelte";
  import type { SvelvetCanvasPos } from "@shared/ui/UIGraph";

  // TODO: Abstract panelId to use a generic UUID
  // export let panelId = 0;
  export let panelId = Math.round(10000000.0 * Math.random()).toString();

  let graphIds = graphMall.getAllGraphUUIDsReactive();
  let graphId = $graphIds[0];

  let thisGraphStore: Readable<GraphStore | null>;
  let graphNodes: Readable<any[]>;

  let canvasPos: SvelvetCanvasPos = { x: 0, y: 0 };
  let canvasWidth = 0;
  let canvasHeight = 0;

  function updateOnGraphId(graphId: string) {
    thisGraphStore = graphMall.getGraphReactive(graphId);
    if ($thisGraphStore) {
      graphNodes = $thisGraphStore.getNodesReactive();
    }
  }

  function addNode() {
    // TODO: Add new nodes in the center of the current view / under the mouse cursor when right-clicking.
    //       We're gonna have to fork svelvet + expose the `translation` property manually since at the moment it
    //       does not support binds. 🗡😁
    // $thisGraphStore?.addNode("hello-plugin.Jake", { x: canvasPos.x + canvasWidth/2, y: canvasPos.y + canvasHeight/2 });

    $thisGraphStore?.addNode("hello-plugin.Jake", {
      x: 1000 * Math.random(),
      y: 1000 * Math.random(),
    });
  }

  function edgeDropped(...e: any) {
    console.log(e);
  }

  // Only updates when _graphId_ changes
  $: updateOnGraphId(graphId);

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
    on:edgeDrop="{edgeDropped}"
    bind:translation="{canvasPos}"
    bind:width="{canvasWidth}"
    bind:height="{canvasHeight}"
  >
    {#each $graphNodes || [] as node}
      {#key node}
        <PluginNode panelId="{panelId}" graphId="{graphId}" node="{node}" />
      {/key}
    {/each}
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
