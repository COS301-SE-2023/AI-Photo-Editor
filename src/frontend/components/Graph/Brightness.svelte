<script lang="ts">
	// import NodeWrapper from 
	import { Node, Slider, generateOutput, generateInput, } from "svelvet";

	type Inputs = {
		brightness: number;
	};

	const initialData = {
		brightness: 1
	};

	const inputs = generateInput(initialData);

	export const processor = (inputs: Inputs) => {
		console.log(inputs.brightness);
		return inputs.brightness;
	};
	const output = generateOutput(inputs, processor);
</script>

<Node position={{ x: 600, y: 200 }} >
	<div class="flex flex-col bg-zinc-700 min-w-64 border-2 border-zinc-500 p-2 rounded-lg">
		<div class="border-b-2 border-zinc-500 mb-4">
			<p class="text-base font-sans text-white mb-1">Brightness<p/>
		</div>
		<div class="flex flex-col justify-centre items-center">
			<Slider min={0} max={1} fixed={1} step={0.1} parameterStore={$inputs.brightness} fontColor="white" barColor="grey" bgColor="black"/>
		</div>
	</div>
</Node>


<style>
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

	.node-body {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
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
	.destroy {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		width: 100%;
		border-bottom: solid 1px;
		border-color: lightgray;
	}
</style>