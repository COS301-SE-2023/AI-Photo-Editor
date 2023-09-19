<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import ColorPicker from "svelte-awesome-color-picker";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import ColorPickerWrapper from "./ColorPicker/ColorPickerWrapper.svelte";
  import ColorPickerTextInput from "./ColorPicker/ColorPickerTextInput.svelte";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;
  const dispatch = createEventDispatcher();

  if (!inputStore.inputs[config.componentId])
    inputStore.inputs[config.componentId] = writable("#f43e5cff");

  console.log("CONFIG", config);
  console.log("INPUTS", inputStore.inputs);

  $: valStore = inputStore.inputs[config.componentId];

  setTimeout(() => {
    // valStore = inputStore.inputs[config.componentId];
    console.log("VALSTORE", valStore, $valStore);
  }, 200);

  console.log("VALSTORE", valStore, $valStore);
</script>

<div class="picker">
  <!-- Old Svelvet ColorPicker: -->
  <!-- <ColorPicker parameterStore="{inputStore.inputs[config.componentId]}" /> -->

  {#if typeof $valStore === "string"}
    <ColorPicker
      bind:hex="{$valStore}"
      label="{config.label}"
      components="{{
        wrapper: ColorPickerWrapper,
        textInput: ColorPickerTextInput,
      }}"
    />
  {:else}
    ERR: Invaid colour: {JSON.stringify($valStore)}
  {/if}
</div>

<style>
  .picker {
    margin: auto;
    width: 100%;
    height: 100%;
  }

  /* .picker :global(label .color) {
		width: 45px !important;
		height: 24px !important;
		border-radius: 8px !important;
    border: 2px solid black;
	}

  .picker :global(label .alpha) {
    position: absolute !important;
		width: 45px !important;
		height: 24px !important;
    border-radius: 0px !important;
  }

  .picker :global(label .alpha::after) {
    position: absolute;
    content: '' !important;
		width: 45px !important;

		height: 24px !important;
    border-radius: 0px !important;
  } */
</style>
