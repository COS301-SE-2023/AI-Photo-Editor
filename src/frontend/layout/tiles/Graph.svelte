<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet, Node } from "svelvet";
  import { graphStores } from "../../stores/GraphStore";

  // TODO: Abstract panelId to use a generic UUID
  // export let panelId = 0;
  let panelId = Math.round(10000000 * Math.random()).toString();
  export let graphId = "default";
  let thisGraphStore = graphStores[graphId];

  setInterval(() => {
    thisGraphStore.addNode();
  }, 4000);
</script>

<Svelvet id="my-canvas" zoom="{0.7}" minimap theme="custom-dark">
  <!-- title="Svelvet-{panelId}" -->
  {#each $thisGraphStore.nodes as node (node.id)}
    <Node bgColor="#ec4899" height="{node.dims.h}" position="{node.pos}" id="{panelId}-{node.id}" />
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
