<script lang="ts">
  import { Anchor, Node, Slider, generateInput } from "svelvet";
  import { writable } from "svelte/store";
  import { graphMall, type GraphNode } from "lib/stores/GraphStore";
  // import NodeUiFragment from "./NodeUIFragment.svelte";

  export let graphId: string;
  export let node: GraphNode;
  export let svelvetNodeId: string;

  // Parameter store
  type Inputs = { width: number };
  const initialData: Inputs = { width: 2.5 };
  const inputs = generateInput(initialData);

  const nodePos = writable(node.pos);
  const nodeConns = writable(node.connections);

  nodePos.subscribe(async (pos) => {
    // On node moved
    graphMall.updateNode(graphId, node.id, (node) => {
      node.pos = pos;
      return node;
    });
  });

  nodeConns.subscribe(async (conns) => {
    // On connection changed
    graphMall.updateNode(graphId, node.id, (node) => {
      node.connections = conns;
      return node;
    });
  });

  // graphMall.subscribe((graphMall) => {
  // });

  setInterval(() => {
    nodePos.set(node.pos);
    nodeConns.set(node.connections);
  }, 100);
</script>

{#if svelvetNodeId !== ""}
  <!-- width="{graphNode.dims.w}"
height="{graphNode.dims.h}" -->
  <Node
    bgColor="#262630"
    textColor="#ffffff"
    bind:position="{$nodePos}"
    id="{svelvetNodeId}"
    borderColor="#ffffff"
    borderWidth="{3}"
    borderRadius="{10}"
    inputs="{2}"
    outputs="{1}"
  >
    <div class="node">
      <div class="header">
        <h1>{node.name}</h1>
      </div>
      <div class="node-body">
        <!-- TODO:  -->
        <!-- <NodeUiFragment />  -->
        <Slider min="{1}" max="{12}" fixed="{1}" step="{0.1}" parameterStore="{$inputs.width}" />
      </div>
    </div>

    <div>
      <Anchor dynamic="{true}" id="{node.id}-in" />
      <!-- bind:connections={$nodeConns} -->
      <br />
      <!-- <Anchor
        dynamic="{true}"
        id="{node.id}-in2"
        connections={[]}
    /> -->
    </div>
  </Node>
{/if}

<style>
  .node-body {
    border: 1px solid grey;
    padding: 1em;
  }

  .node {
    box-sizing: border-box;
    width: fit-content;
    border-radius: 8px;
    height: fit-content;
    position: relative;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 10px;
  }

  h1 {
    font-size: 0.9rem;
    font-weight: 200;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    padding-bottom: 8px;
    border-color: inherit;
  }

  .output-anchors {
    position: absolute;
    right: -24px;
    top: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;
    border-bottom: solid 1px;
    border-color: lightgray;
    font-family: "Courier New", Courier, monospace;
  }
</style>
