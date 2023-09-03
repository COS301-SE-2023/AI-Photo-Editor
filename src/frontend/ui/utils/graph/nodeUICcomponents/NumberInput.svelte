<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  const randomId = Math.random().toString(32);
  // export let label: string;
  // export let inputStore: UIValueStore;

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable(0);

  $: valStore = inputStore.inputs[config.componentId];
</script>

<label for="{randomId}-{config.componentId}">{config.label}</label>
<input name="{randomId}-{config.componentId}" type="number" bind:value="{$valStore}" />

<style>
  input {
    color: #cdd6f4;
    background-color: #1f1f28;
    border: none;
    padding: 0.1em;
  }

  label {
    text-align: right;
    clear: both;
    float: left;
    margin-right: 1em;
  }
</style>
