<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet } from "svelvet";
  import { graphStores } from "../../stores/GraphStore";
  import PluginNode from "../../graph/PluginNode.svelte";

  // TODO: Abstract panelId to use a generic UUID
  // export let panelId = 0;
  export let panelId = Math.round(10000000 * Math.random()).toString();
  export let graphId = "default";
  let thisGraphStore = graphStores[graphId];
</script>

<!-- <button on:click={() => thisGraphStore.addNode()}>Add Node</button> -->
<Svelvet id="my-canvas" zoom="{0.7}" minimap theme="custom-dark">
  {#each $thisGraphStore.nodes as node (node.id)}
    <PluginNode graphNode="{node}" nodeId="{panelId}-{node.id}" />
  {/each}
</Svelvet>

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
</style>
