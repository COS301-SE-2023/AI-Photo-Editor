<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";
  import { ColorPicker, type CSSColorString } from "blix_svelvet";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;
  const dispatch = createEventDispatcher();

  if (!inputStore.inputs[config.componentId])
    inputStore.inputs[config.componentId] = writable("#ffffff" as CSSColorString);

  $: valStore = inputStore.inputs[config.componentId];

  function handleInputInteraction() {
    dispatch("inputInteraction", { id: config.componentId, value: $valStore });
  }
</script>

<div class="picker">
  <ColorPicker parameterStore="{valStore}" on:wheelReleased="{handleInputInteraction}" />
</div>

<style>
  .picker {
    margin: auto;
    width: min-content;
    height: min-content;
  }
</style>
