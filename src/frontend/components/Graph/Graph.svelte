<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet, Node } from "svelvet";
  import { graphStore } from "../../stores/GraphStore";
  import NodeWrapper from "./NodeWrapper.svelte";
  import type { GraphNode } from "../../types";

  const nodes: GraphNode[] = [
    {
      id: "brightness",
      name: "Brightness",
      slider: { min: 0, max: 2, step: 0.1, fixed: 1, value: 1 },
    },
    {
      id: "saturation",
      name: "Saturation",
      slider: { min: 0, max: 2, step: 0.1, fixed: 1, value: 1 },
    },
  ];

  graphStore.set({ nodes });

  graphStore.subscribe((store) => {
    console.log(store.nodes);
  });
</script>

<Svelvet id="my-canvas" zoom="{0.5}" minimap theme="custom-dark">
  {#each $graphStore.nodes as node}
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
