<script lang="ts">
  import { Node, Slider, generateInput /* generateOutput */, type GraphStore } from "svelvet";
  import { graphMall } from "../stores/GraphStore";
  import { writable } from "svelte/store";
  // import NodeUiFragment from "./NodeUIFragment.svelte";

  export let graphId: string;
  export let nodeId: string;
  export let svelvetNodeId: string;

  let thisGraphStore = $graphMall.getGraph(graphId);

  // Parameter store
  type Inputs = { width: number };
  const initialData: Inputs = { width: 2.5 };
  const inputs = generateInput(initialData);

  const nodePos = writable($thisGraphStore.nodes[nodeId]?.pos);

  nodePos.subscribe(async (pos) => {
    await thisGraphStore.setNodePos(nodeId, pos);
  });
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
    inputs="{3}"
    outputs="{1}"
  >
    <div class="node">
      <div class="header">
        <h1>{$thisGraphStore.nodes[nodeId].name}</h1>
      </div>
      <!--  -->
      <div class="node-body">
        <!-- TODO:  -->
        <!-- <NodeUiFragment />  -->
        <Slider min="{1}" max="{12}" fixed="{1}" step="{0.1}" parameterStore="{$inputs.width}" />
      </div>
      <!--  -->
    </div>

    <!-- {#if outputStore && key}
	<div class="output-anchors">
		<Anchor
			id={key}
			connections={[['output', key]]}
			let:linked
			let:connecting
			let:hovering
			{outputStore}
			output
		>
			<CustomAnchor {hovering} {connecting} {linked} />
		</Anchor>
	</div>
{/if} -->

    <!-- <div>
    <Anchor
        id="{nodeId}-in"
        connections={[]}
    />
    <br />
    <Anchor
        id="{nodeId}-in2"
        connections={[]}
    />
</div> -->

    <!-- {#each node.connections as _}
    <div class="node-body">
    asdf
    </div>
{/each} -->
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
