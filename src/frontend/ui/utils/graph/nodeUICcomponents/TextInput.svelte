<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import { createEventDispatcher } from "svelte";
  // export let label: string;
  // export let inputStore: UIValueStore;

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;
  const dispatch = createEventDispatcher();

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable("");
  let valStore;
  let first = true;

  $: {
    valStore = inputStore.inputs[config.componentId];
    if (!first) {
      dispatch("inputInteraction", { id: config.componentId, value: $valStore });
    } else {
      first = false;
    }
  }
</script>

<input type="text" bind:value="{$valStore}" />

<style>
  input {
    color: #cdd6f4;
    background-color: #1f1f28;
    border: none;
    padding: 0.1em;
  }
</style>
