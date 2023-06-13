<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet, Node } from "svelvet";
  import { graphStore } from "../../stores/GraphStore";
  import NodeWrapper from "../../components/Graph/NodeWrapper.svelte";
  export let panelId = 0;

  let nodeCounter = 0;
  let nodes = [
    {
      id: `Node-${panelId}-${nodeCounter++}`,
      position: { x: 0, y: 0 },
      height: 100,
    },
    {
      id: `Node-${panelId}-${nodeCounter++}`,
      position: { x: 200, y: 200 },
      height: 200,
    },
  ];
</script>

<Svelvet id="my-canvas" zoom="{0.7}" minimap theme="custom-dark">
  {#each $graphStore.nodes as node (node.id)}
    <Node id="{node.name}">
      <NodeWrapper node="{node}" />
    </Node>
  {/each}
</Svelvet>

<Svelvet zoom="{0.5}" minimap theme="custom-dark" id="Graph-{panelId}" fitView="resize">
  <!-- title="Svelvet-{panelId}" -->

  {#each nodes as node}
    <Node bgColor="#ec4899" height="{node.height}" position="{node.position}" id="{node.id}" />
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
