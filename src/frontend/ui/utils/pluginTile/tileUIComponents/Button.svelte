<script lang="ts">
  // import { writable } from "svelte/store";
  // import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  // export let props: UIComponentProps;
  // export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  // if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable(0);
</script>

<button
  class="rounded-md border border-zinc-600 bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 active:bg-zinc-800/50"
  >{config.label}</button
>

<style>
  button {
    width: 100%;
    height: 60px;
  }
</style>
