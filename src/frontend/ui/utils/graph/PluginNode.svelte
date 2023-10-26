<script lang="ts">
  import { GraphNode, NodeStylingStore } from "@shared/ui/UIGraph";
  import { Anchor, Node, type CSSColorString } from "blix_svelvet";
  import { colord, extend } from "colord";
  import a11yPlugin from "colord/plugins/a11y";
  import { createEventDispatcher } from "svelte";
  import { graphMall } from "../../../lib/stores/GraphStore";
  import { nodeIdLastClicked } from "../../../lib/stores/MediaStore";
  import { toolboxStore } from "../../../lib/stores/ToolboxStore";
  import NodeUiFragment from "./NodeUIFragment.svelte";
  import PluginAnchor from "./PluginAnchor.svelte";

  extend([a11yPlugin]);

  const dispatch = createEventDispatcher();

  export let graphId: string;
  export let panelId: number;
  export let node: GraphNode;
  // let activeInput = false;

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

  function changeBrightness(color: CSSColorString, percent: number) {
    return colord(color).lighten(percent).toRgbString();
  }

  function checkShowTextOutline(color: string) {
    const readable = colord(color).isReadable();
    return readable;
  }

  async function nodeClicked(e: CustomEvent) {
    if (e.detail.e.button === 2) {
      const [_2, ...nodeUUIDParts] = e.detail.node.id.split("_");
      const nodeUUID = nodeUUIDParts.join("_");
      console.log("REMOVE NODE");
      await window.apis.graphApi.removeNode(graphId, nodeUUID);
    } else {
      nodeIdLastClicked.set(node.uuid);
    }
  }

  async function nodeDragReleased(e: CustomEvent) {
    await window.apis.graphApi.setNodePos(graphId, node.uuid, { x: $nodePos.x, y: $nodePos.y });
  }

  function handleInputInteraction(e: CustomEvent) {
    graphMall.getGraph(graphId).handleNodeInputInteraction(graphId, node.uuid, e.detail);
  }
</script>

{#if svelvetNodeId !== ""}
  <Node
    bgColor="#262630"
    textColor="#ffffff"
    bind:position="{$nodePos}"
    id="{svelvetNodeId}"
    borderColor="transparent"
    borderWidth="1px"
    borderRadius="{10}"
    selectionColor="#f43e5c"
    on:selected="{() => console.log('selected')}"
    on:nodeClickReleased="{nodeClicked}"
    on:nodeDragReleased="{nodeDragReleased}"
  >
    <div class="node">
      <div class="header">
        <h1>{$toolboxNode?.title || node.displayName}</h1>
        <!-- {#if $toolboxNode?.description}
          <div class="descriptionTooltip">
            {$toolboxNode.description}<br />
          </div>
        {/if} -->
      </div>
      <!-- <div class="node-body" style="max-width: 400px">
        <h2>{Math.floor(Math.random() * 100000000)}</h2>
        <h2>Signature: {node.signature}</h2>
        <h2>SvelvetNodeId: {svelvetNodeId}</h2>
        {JSON.stringify({ ...$toolboxNode, ui: undefined })}
      </div> -->
      <div class="node-body" style="max-width: 400px">
        <NodeUiFragment
          inputStore="{node.inputUIValues}"
          ui="{$toolboxNode?.ui}"
          uiConfigs="{$toolboxNode?.uiConfigs}"
          on:inputInteraction="{handleInputInteraction}"
        />
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
                {@const typeCol = changeBrightness(color, 0.3)}
                <div class="anchorTooltip">
                  {#if input.displayName}
                    {input.displayName}<br />
                  {/if}
                  &lt;<span
                    style:color="{typeCol}"
                    class="{checkShowTextOutline(typeCol) ? 'outlineText' : ''}"
                    >{input.type || "any"}</span
                  >&gt;
                </div>
              {/if}
              <PluginAnchor
                input="{true}"
                output="{false}"
                icon="amogus"
                connecting="{connecting}"
                hovering="{false}"
                bgColor="{color}"
                connected="{false}"
              />
            </Anchor>
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
                {@const typeCol = changeBrightness(color, 0.3)}
                <div class="anchorTooltip">
                  {#if output.displayName}
                    {output.displayName}<br />
                  {/if}
                  <!-- &lt;{output.type || "any"}&gt; -->
                  &lt;<span
                    style:color="{typeCol}"
                    class="{checkShowTextOutline(typeCol) ? 'outlineText' : ''}"
                    >{output.type || "any"}</span
                  >&gt;
                </div>
              {/if}
              <PluginAnchor
                input="{true}"
                output="{false}"
                icon="amogus"
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
    min-width: max-content;
    border-radius: 8px;
    height: fit-content;
    position: relative;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 10px;
  }

  .descriptionTooltip {
    display: block;
    position: absolute;
    background: #444444;
    color: white;
    border-radius: 2px;
    padding: 0.6em;
    bottom: 100%;
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
    left: 110%;
    top: -3.5em;
  }
  .outlineText {
    background-color: lightgrey;
    border-radius: 0.25em;
    padding: 0.1em;
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
