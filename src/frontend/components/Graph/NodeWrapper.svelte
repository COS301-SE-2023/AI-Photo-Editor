<script lang="ts">
  import { Slider, generateInput, generateOutput, Anchor } from "svelvet";
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
      store.nodes.forEach((n) => {
        if (n.id === node.id && n.slider) n.slider.value = inputs.value;
      });
      return store;
    });
    return inputs.value;
  };

  generateOutput(inputs, processor);

  function removeNode(event: Event) {
    event.preventDefault();
    graphStore.update((store) => {
      for (let i = 0; i < store.nodes.length; i++) {
        if (store.nodes[i].id === node.id) {
          store.nodes.splice(i, 1);
        }
      }
      return store;
    });
  }
</script>

<Anchor input />

<div class="flex w-56 flex-col rounded-lg border-2 border-zinc-500 bg-zinc-700 p-2">
  <div class="mb-4 flex border-b-2 border-zinc-500">
    <p class="mb-1 font-sans text-base text-white">{node.name}</p>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="ml-auto h-6 w-6 stroke-zinc-100 hover:cursor-pointer hover:stroke-rose-500"
      on:click="{removeNode}"
      on:keydown="{removeNode}"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      ></path>
    </svg>
  </div>
  {#if node.name !== "Output"}
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
  {/if}
</div>

{#if node.name !== "Output"}
  <Anchor output />
{/if}
