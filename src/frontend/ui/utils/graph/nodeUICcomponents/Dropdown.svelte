<script lang="ts">
  import { writable } from "svelte/store";
  import { AnchorValueStore } from "@shared/ui/UIGraph";

  export let params: any[];
  console.log(params);

  let items: { [key: string]: any } = params[0];
  let defaultItem: string = params[1];

  export let inputStore: AnchorValueStore;
  if (!inputStore.inputs["dropdown"]) {
    if (!defaultItem) defaultItem = Object.keys(items)[0];
    inputStore.inputs["dropdown"] = writable(items[defaultItem]);
  }

  $: valStore = inputStore.inputs["dropdown"];
</script>

{#if Object.keys(items).length > 0}
  {#key inputStore.inputs["dropdown"]}
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
