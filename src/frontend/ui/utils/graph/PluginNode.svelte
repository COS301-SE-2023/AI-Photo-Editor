<script lang="ts">
  import { Anchor, Node, Slider, generateInput } from "svelvet";
  import { type GraphNode, activateStorable } from "@shared/ui/UIGraph";
  import { toolboxStore } from "lib/stores/ToolboxStore";

  export let graphId: string;
  export let node: GraphNode;
  export let svelvetNodeId: string;

  $: toolboxNode = toolboxStore.getNodeReactive(node.signature);

  // Parameter store
  type Inputs = { width: number };
  const initialData: Inputs = { width: 2.5 };
  const inputs = generateInput(initialData);

  const nodePos = activateStorable(node.styling.pos);
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
          <h1>{node.displayName}</h1>
          <br /><br />
          <h2>Signature: {node.signature}</h2>
        </div>
        <div class="node-body">
          {JSON.stringify({ ...toolboxNode, ui: null })}
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
