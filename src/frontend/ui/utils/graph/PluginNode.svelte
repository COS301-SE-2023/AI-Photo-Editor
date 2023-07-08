<script lang="ts">
  import { Anchor, Node } from "svelvet";
  import { GraphNode, NodeStylingStore } from "@shared/ui/UIGraph";
  import { toolboxStore } from "lib/stores/ToolboxStore";
  import NodeUiFragment from "./NodeUIFragment.svelte";

  export let panelId: string;
  export let graphId: string;
  export let node: GraphNode;

  $: svelvetNodeId = `${panelId}_${graphId.substring(0, 6)}_${node.id.substring(0, 6)}`;
  $: toolboxNode = toolboxStore.getNodeReactive(node.signature);

  // Parameter store
  // type Inputs = { width: number };
  // const initialData: Inputs = { width: 2.5 };
  // const inputs = generateInput(initialData);

  if (!node.styling) {
    node.styling = new NodeStylingStore();
  }
  const nodePos = node.styling.pos;
</script>

{#if svelvetNodeId !== ""}
  {#key nodePos}
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
          <h1>{$toolboxNode?.title || node.displayName}</h1>
        </div>
        <div class="node-body" style="max-width: 400px">
          <h2>Signature: {node.signature}</h2>
          <h2>SvelvetNodeId: {svelvetNodeId}</h2>
          {JSON.stringify({ ...$toolboxNode, ui: null })}
          <!-- TODO:  -->
          <!-- <Slider min="{1}" max="{12}" fixed="{1}" step="{0.1}" parameterStore="{$inputs.width}" /> -->
        </div>
        <div class="node-body" style="max-width: 400px">
          <NodeUiFragment ui="{$toolboxNode?.ui}" />
        </div>

        <div>
          {#if $toolboxNode}
            {#each $toolboxNode.inputs as input}
              <Anchor id="{svelvetNodeId}_{input.id}" direction="west" />
              {svelvetNodeId}-{input.id}
            {/each}
            <!-- bind:connections={$nodeConns} -->
            <br />
            <!-- <Anchor
        dynamic="{true}"
        id="{node.id}-in2"
        connections={[]}
    /> -->
          {/if}
        </div>
      </div></Node
    >
  {/key}
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

  /* .output-anchors {
    position: absolute;
    right: -24px;
    top: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  } */
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
