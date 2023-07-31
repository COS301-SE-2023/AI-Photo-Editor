<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  let items: { [key: string]: any } = props["options"]!;
  let defaultItem = config.defaultValue as string | undefined;

  if (!inputStore.inputs[config.componentId]) {
    if (!defaultItem) defaultItem = Object.keys(items)[0];
    inputStore.inputs[config.componentId] = writable(items[defaultItem]);
  }

  $: valStore = inputStore.inputs[config.componentId];
</script>

{#if Object.keys(items).length > 0}
  {#key inputStore.inputs[config.componentId]}
    <!-- <select bind:value={inputStore.inputs["dropdown"]}> -->
    <select bind:value="{$valStore}">
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
    color: black;
  }
</style>
