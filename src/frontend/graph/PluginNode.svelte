<script lang="ts">
  import { Node, Slider, generateInput /* generateOutput */ } from "svelvet";
  import type { GraphNode } from "../stores/GraphStore";
  // import NodeUiFragment from "./NodeUIFragment.svelte";

  export let graphNode: GraphNode | null = null;
  export let nodeId: string;

  type Inputs = {
    width: number;
  };

  const initialData: Inputs = {
    width: 2.5,
  };
  const inputs = generateInput(initialData);
  // const processor = (inputs: Inputs) => inputs.width;
  // const output = generateOutput(inputs, processor);

  // const ui: { [key: string]: { [key:string]: string } } = {
  // 	"val1": {
  // 		"type": "slider",
  // 	}
  // }

  const title = "Custom Node";
</script>

{#if graphNode != null}
  <!-- width="{graphNode.dims.w}"
height="{graphNode.dims.h}" -->
  <Node
    bgColor="#262630"
    textColor="#ffffff"
    position="{graphNode.pos}"
    id="{nodeId}"
    borderColor="#ffffff"
    borderWidth="{2}"
    borderRadius="{5}"
    inputs="{3}"
    outputs="{1}"
  >
    <div class="node">
      <div class="header">
        <h1>{title}</h1>
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
