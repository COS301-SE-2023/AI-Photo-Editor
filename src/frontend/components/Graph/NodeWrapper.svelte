<script lang="ts">
  import { Slider, generateInput, generateOutput } from "svelvet";
  import type { GraphNode } from "../../types";
  import { graphStore } from "../../stores/GraphStore";

  export let node: GraphNode;

  type Inputs = {
    value: number;
  };

  const initialData = {
    value: node.slider?.value || 0,
  };

  const inputs = generateInput(initialData);

  export const processor = (inputs: Inputs) => {
    graphStore.update((store) => {
      let newState = { ...store };
      newState.nodes.forEach((n) => {
        if (n.id === node.id && n.slider) n.slider.value = inputs.value;
      });
      return store;
    });
    return inputs.value;
  };

  generateOutput(inputs, processor);
</script>

<div class="min-w-64 flex flex-col rounded-lg border-2 border-zinc-500 bg-zinc-700 p-2">
  <div class="mb-4 border-b-2 border-zinc-500">
    <p class="mb-1 font-sans text-base text-white">{node.name}</p>
    <p></p>
  </div>
  <div class="justify-centre flex flex-col items-center">
    <Slider
      min="{node.slider?.min}"
      max="{node.slider?.max}"
      fixed="{node.slider?.fixed}"
      step="{node.slider?.step}"
      parameterStore="{$inputs.value}"
      fontColor="white"
      barColor="grey"
      bgColor="black"
    />
  </div>
</div>
