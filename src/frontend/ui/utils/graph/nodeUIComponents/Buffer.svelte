<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import { blixStore } from "../../../../lib/stores/BlixStore";

  // export let label: string;
  // export let inputStore: UIValueStore;

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable({});

  $: valStore = inputStore.inputs[config.componentId];
</script>

<textarea disabled value="{JSON.stringify($valStore)}"></textarea>

<style>
  textarea {
    border: 2px solid cyan;
    color: #cdd6f4;
    background-color: #1f1f28;
    border: none;
    padding: 0.1em;
    overflow: hidden;
  }
</style>
