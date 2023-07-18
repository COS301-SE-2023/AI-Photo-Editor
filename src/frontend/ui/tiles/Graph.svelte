<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet } from "svelvet";
  import { type Readable } from "svelte/store";
  import { graphMall } from "@frontend/lib/stores/GraphStore";
  import PluginNode from "../utils/graph/PluginNode.svelte";
  import type { GraphNode } from "@shared/ui/UIGraph";
  import { projectsStore } from "../../lib/stores/ProjectStore";

  // TODO: Abstract panelId to use a generic UUID
  // export let panelId = 0;
  export let panelId = Math.round(10000000 * Math.random()).toString();

  let graphIds = projectsStore.activeProjectGraphIds;
  let graphId = $graphIds[0];

  $: thisGraphStore = graphMall.getGraphReactive(graphId);
  let graphNodes: Readable<GraphNode[]> | undefined;
  $: graphNodes = $thisGraphStore?.getNodesReactive();
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
  <!-- {JSON.stringify($graphNodes)} -->
  <Svelvet id="my-canvas" zoom="{0.7}" minimap theme="custom-dark">
    {#each $graphNodes || [] as node}
      <PluginNode graphId="{graphId}" node="{node}" svelvetNodeId="{panelId}-{node.id}" />
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
