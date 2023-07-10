<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet } from "blix_svelvet";
  import { type Readable } from "svelte/store";
  import { graphMall } from "lib/stores/GraphStore";
  import PluginNode from "../utils/graph/PluginNode.svelte";

  // TODO: Abstract panelId to use a generic UUID
  // export let panelId = 0;
  export let panelId = Math.round(10000000.0 * Math.random()).toString();

  let graphIds = graphMall.getAllGraphUUIDsReactive();
  let graphId = $graphIds[0];

  let thisGraphStore: Readable<any>;
  let graphNodes: Readable<any[]>;

  function updateOnGraphId(graphId: string) {
    thisGraphStore = graphMall.getGraphReactive(graphId);
    if ($thisGraphStore) {
      graphNodes = $thisGraphStore.getNodesReactive();
    }
  }

  // Only updates when _graphId_ changes
  $: updateOnGraphId(graphId);

  // $: console.log("GRAPH MALL UPDATED", $graphMall);
</script>

<div class="hoverElements">
  <button on:click="{() => $thisGraphStore?.addNode()}">Add Node</button>
  <select name="graphPicker" class="dropdown" bind:value="{graphId}">
    {#each $graphIds as id}
      <option value="{id}">{id.slice(0, 8)}</option>
    {/each}
  </select>
</div>

{#if thisGraphStore}
  <Svelvet id="{panelId}-{graphId}" zoom="{0.7}" minimap theme="custom-dark">
    {#each $graphNodes || [] as node}
      <PluginNode panelId="{panelId}" graphId="{graphId}" node="{node}" />
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
