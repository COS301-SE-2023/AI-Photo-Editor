<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";

  export let label: string;
  export let inputStore: UIValueStore;

  if (!inputStore.inputs[label]) inputStore.inputs[label] = writable("");

  $: valStore = inputStore.inputs[label];
</script>

<input type="text" bind:value="{$valStore}" />

<style>
  input {
    color: black;
  }
</style>
