<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import { RadioGroup } from "blix_svelvet";

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

<!-- <Slider parameterStore="{valStore}"
  min="{min}"
  max="{max}"
  step="{step}"
  fixed="{1}"
  bgColor="#1F1F28"
  barColor="#f43e5c"
  label="{config.label}"
/> -->

<RadioGroup parameterStore="{$valStore}">
  {#each Object.keys(items) as itemKey}
    <label>
      <input type="radio" value="{items[itemKey]}" />
      {itemKey}
    </label>
  {/each}
</RadioGroup>

<!-- 
{#if Object.keys(items).length > 0}
  {#key inputStore.inputs[config.componentId]}
    <select bind:value="{$valStore}">
      {#each Object.keys(items) as itemKey}
        <option value="{items[itemKey]}">{itemKey}</option>
      {/each}
    </select>
  {/key}
{:else}
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
</style> -->
