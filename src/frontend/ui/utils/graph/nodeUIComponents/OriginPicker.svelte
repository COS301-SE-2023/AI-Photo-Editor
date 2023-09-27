<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  const randomId = Math.random().toString(32); // TODO: Replace this (and others like it) with a global UUID function

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  let items: { [key: string]: any } = props["options"]!;
  let defaultItem = config.defaultValue as string | undefined;

  if (!inputStore.inputs[config.componentId]) {
    if (!defaultItem) defaultItem = (Object.keys(items) ?? ["err"])[0];
    inputStore.inputs[config.componentId] = writable(items[defaultItem]);
  }

  $: valStore = inputStore.inputs[config.componentId];
  console.log($valStore);
</script>

{#if Object.keys(items).length > 0}
  {#each Object.keys(items) as itemKey}
    <label>
      <input
        type="radio"
        name="{randomId}-{config.componentId}"
        bind:group="{$valStore}"
        value="{items[itemKey]}"
      />
      {itemKey}
    </label>
  {/each}
{/if}

<style>
  label {
    color: #cdd6f4;
    /* background-color: #1f1f28; */
    border: none;
    padding: 0.1em;
    text-align: left;
  }
</style>
