<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet, Node } from "svelvet";
  import { graphStore } from "../../stores/GraphStore";
  import NodeWrapper from "./NodeWrapper.svelte";
</script>

<Svelvet id="my-canvas" zoom="{0.7}" minimap theme="custom-dark">
  {#each $graphStore.nodes as node (node.id)}
    <Node>
      <NodeWrapper node="{node}" />
    </Node>
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
