<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import { createEventDispatcher } from "svelte";
  // export let label: string;
  // export let inputStore: UIValueStore;

  const randomId = Math.random().toString(32); // TODO: Replace this (and others like it) with a global UUID function

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;
  const dispatch = createEventDispatcher();

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable("");
  let valStore;

  $: valStore = inputStore.inputs[config.componentId];

  // Only add event when user changes text, if pasted by ai, do nothing
  function handleInteraction() {
    dispatch("inputInteraction", { id: config.componentId, value: $valStore });
  }
</script>

<label for="{randomId}-{config.componentId}"> {config.label} </label>
{#if props?.multiline === true}
  <textarea
    name="{randomId}-{config.componentId}"
    bind:value="{$valStore}"
    on:paste="{null}"
    on:input="{handleInteraction}"></textarea>
{:else}
  <input
    name="{randomId}-{config.componentId}"
    type="text"
    bind:value="{$valStore}"
    on:paste="{null}"
    on:input="{handleInteraction}"
  />
{/if}

<style>
  label {
    color: #cdd6f4;
    /* background-color: #1f1f28; */
    border: none;
    padding: 0.1em;
    float: left;
  }

  textarea {
    border: 2px solid cyan;
    color: #cdd6f4;
    background-color: #1f1f28;
    border: none;
    padding: 0.1em;
    overflow: hidden;
  }

  input[type="text"] {
    color: #cdd6f4;
    background-color: #1f1f28;
    border: none;
    padding: 0.1em;
    padding-right: 0.8em;
    margin: 0.2em;
  }
</style>
