<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import { createEventDispatcher } from "svelte";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;
  const dispatch = createEventDispatcher();

  let items: { [key: string]: any } = props["options"]!;
  let defaultItem = config.defaultValue as string | undefined;

  if (!inputStore.inputs[config.componentId]) {
    if (!defaultItem) defaultItem = Object.keys(items)[0];
    inputStore.inputs[config.componentId] = writable(items[defaultItem]);
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
        <option value="{items[itemKey]}">{itemKey}</option>
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
  }
</style>
