<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import { cacheStore } from "../../../../lib/stores/CacheStore";
  import { blixStore } from "../../../../lib/stores/BlixStore";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import { createEventDispatcher } from "svelte";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;
  const dispatch = createEventDispatcher();

  $: items = $cacheStore;
  let defaultItem = config.defaultValue as string | undefined;

  if (!inputStore.inputs[config.componentId]) {
    if (!defaultItem) defaultItem = Object.keys($cacheStore)[0];
    inputStore.inputs[config.componentId] = writable("");
  }

  $: valStore = inputStore.inputs[config.componentId];

  function handleInputInteraction() {
    dispatch("inputInteraction", { id: config.componentId, value: $valStore });
  }
</script>

{#if Object.keys(items).length > 0}
  {#key inputStore.inputs[config.componentId]}
    <select bind:value="{$valStore}" on:change="{handleInputInteraction}">
      {#each Object.keys(items) as itemKey}
        {#if !$blixStore.production}
          <option value="{itemKey}"
            >{items[itemKey].name} [{itemKey}] ({items[itemKey].contentType})</option
          >
        {:else}
          <option value="{itemKey}">{items[itemKey].name}</option>
        {/if}
      {/each}
    </select>
  {/key}
{:else}
  <!-- No items to display -->
  <select>
    <option selected disabled>Add an asset</option>
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
