<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  // export let label: string;
  // export let inputStore: UIValueStore;

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable("");

  $: valStore = inputStore.inputs[config.componentId];
</script>

<label>{config.label} <input type="text" bind:value="{$valStore}" /></label>

<style>
  label {
    color: #cdd6f4;
    /* background-color: #1f1f28; */
    border: none;
    padding: 0.1em;
  }

  input {
    color: #cdd6f4;
    background-color: #1f1f28;
    border: none;
    padding: 0.1em;
    padding-right: 0.8em;
    margin: 0.2em;
  }
</style>
