<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet } from "svelvet";
  import { graphMall } from "../../stores/GraphStore";
  import PluginNode from "../../graph/PluginNode.svelte";

  // TODO: Abstract panelId to use a generic UUID
  // export let panelId = 0;
  export let panelId = Math.round(10000000 * Math.random()).toString();

  let graphIds: any;
  let graphId: any;

  graphMall.subscribe((mall) => {
    console.log("Mall updated");
    graphIds = mall.getAllGraphUUIDs();
    graphId = graphIds[0];
  });

  // export let graphId = graphIds[0]; //TODO: Put this in a selectable dropdown
  let thisGraphStore = $graphMall.getGraph(graphId);

  $: {
    $thisGraphStore.nodes;
    thisGraphStore = thisGraphStore;
  }
</script>

<div class="hoverElements">
  <button on:click="{() => thisGraphStore.addNode()}">Add Node</button>
  <button on:click="{() => (thisGraphStore = thisGraphStore)}">Refresh</button>
  <select name="graphPicker" class="dropdown" bind:value="{graphId}">
    {#each graphIds as id}
      <option value="{id}">{id.slice(0, 8)}</option>
    {/each}
  </select>
</div>

{#if thisGraphStore}
  {#key graphId}
    <Svelvet id="my-canvas" zoom="{0.7}" minimap theme="custom-dark">
      {#each Object.entries($thisGraphStore.nodes) as [nodeId, _]}
        <PluginNode graphId="{graphId}" nodeId="{nodeId}" svelvetNodeId="{panelId}-{nodeId}" />
      {/each}
    </Svelvet>
  {/key}
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
