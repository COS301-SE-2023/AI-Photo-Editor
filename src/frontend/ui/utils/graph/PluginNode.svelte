<script lang="ts">
  import { GraphNode, NodeStylingStore } from "@shared/ui/UIGraph";
  import { Anchor, DefaultAnchor, Node, type CSSColorString } from "blix_svelvet";
  import { toolboxStore } from "../../../lib/stores/ToolboxStore";
  import NodeUiFragment from "./NodeUIFragment.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let panelId: number;
  export let node: GraphNode;

  $: svelvetNodeId = `${panelId}_${node.uuid}`;
  $: toolboxNode = toolboxStore.getNodeReactive(node.signature);

  // Parameter store
  // type Inputs = { width: number };
  // const initialData: Inputs = { width: 2.5 };
  // const inputs = generateInput(initialData);

  if (!node.styling) {
    node.styling = new NodeStylingStore();
  }

  // node.inputUIValues = new AnchorValueStore();

  const nodePos = node.styling.pos;

  function stringToColor(str: string): CSSColorString {
    let hash = 0;
    str.split("").forEach((char) => {
      hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });

    let colour = "#";

    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      colour += value.toString(16).padStart(2, "0");
    }

    return colour as CSSColorString;
  }
</script>

{#if svelvetNodeId !== ""}
  <!-- {#key nodePos} -->
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
  >
    <div class="node">
      <div class="header">
        <h1>{$toolboxNode?.title || node.displayName}</h1>
      </div>
      <div class="node-body" style="max-width: 400px">
        <h2>{Math.floor(Math.random() * 100000000)}</h2>
        <h2>Signature: {node.signature}</h2>
        <h2>SvelvetNodeId: {svelvetNodeId}</h2>
        {JSON.stringify({ ...$toolboxNode, ui: undefined })}
      </div>
      <div class="node-body" style="max-width: 400px">
        <NodeUiFragment inputStore="{node.inputUIValues}" ui="{$toolboxNode?.ui}" />
      </div>

      {#if $toolboxNode}
        <div class="anchors inputs">
          {#each $toolboxNode.inputs as input}
            {@const color = stringToColor(input.type)}
            <Anchor
              input
              dataType="{input.type || ''}"
              bgColor="{color}"
              id="{panelId}_{input.id}"
              direction="west"
              on:connection="{() => dispatch('connection', { input })}"
              on:disconnection="{() => dispatch('disconnection', { input })}"
              let:connecting
              let:hovering
            >
              {#if hovering}
                <div class="anchorTooltip">
                  {input.type || "any"}
                </div>
              {/if}
              <DefaultAnchor
                input="{true}"
                output="{false}"
                connecting="{connecting}"
                hovering="{false}"
                bgColor="{color}"
                connected="{false}"
              />
            </Anchor>
            <!-- bind:connections={$nodeConns} -->
          {/each}
        </div>
        <div class="anchors outputs">
          {#each $toolboxNode.outputs as output}
            {@const color = stringToColor(output.type)}
            <Anchor
              output
              dataType="{output.type || ''}"
              bgColor="{color}"
              id="{panelId}_{output.id}"
              direction="east"
              on:connection="{() => dispatch('connection', { output })}"
              on:disconnection="{() => dispatch('disconnection', { output })}"
              let:connecting
              let:hovering
            >
              {#if hovering}
                <div class="anchorTooltip">
                  {output.type || "any"}
                </div>
              {/if}
              <DefaultAnchor
                input="{true}"
                output="{false}"
                connecting="{connecting}"
                hovering="{false}"
                bgColor="{color}"
                connected="{false}"
              />
            </Anchor>
          {/each}
        </div>
      {/if}
    </div></Node
  >
  <!-- {/key} -->
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

  .anchors {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    z-index: 10;
  }
  .inputs {
    left: -24px;
    top: 40px;
  }
  .outputs {
    right: -24px;
    top: 40px;
  }

  .anchorTooltip {
    position: absolute;
    background: #444444;
    color: white;
    border-radius: 2px;
    padding: 0.2em;
    top: -1.5em;
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
