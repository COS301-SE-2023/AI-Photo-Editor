<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import { cacheStore } from "../../../../lib/stores/CacheStore";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  $: items = $cacheStore;
  // let items: { [key: string]: any } =
  let defaultItem = config.defaultValue as string | undefined;

  if (!inputStore.inputs[config.componentId]) {
    if (!defaultItem) defaultItem = Object.keys($cacheStore)[0];
    inputStore.inputs[config.componentId] = writable("");
  }

  $: valStore = inputStore.inputs[config.componentId];
</script>

{#if Object.keys(items).length > 0}
  {#key inputStore.inputs[config.componentId]}
    <!-- <select bind:value={inputStore.inputs["dropdown"]}> -->
    <select bind:value="{$valStore}">
      {#each Object.keys(items) as itemKey}
        <option value="{itemKey}"
          >{items[itemKey].name} [{itemKey}] ({items[itemKey].contentType})</option
        >
      {/each}
    </select>
  {/key}
{:else}
  <!-- No items to display -->
  <select>
    <option selected disabled>-</option>
  </select>
{/if}

<style>
  select {
    color: #cdd6f4;
    background-color: #1f1f28;
    border: none;
    padding: 0.1em;
    max-width: 200px;
    min-width: 200px;
  }
</style>
