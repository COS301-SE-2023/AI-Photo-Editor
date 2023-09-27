<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  const randomId = Math.random().toString(32); // TODO: Replace this (and others like it) with a global UUID function

  const vOptions = ["t", "m", "b"];
  const hOptions = ["l", "m", "r"];

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  if (!inputStore.inputs[config.componentId]) {
    inputStore.inputs[config.componentId] = writable(config.defaultValue);
  }

  $: valStore = inputStore.inputs[config.componentId];
  console.log($valStore);
</script>

<div class="container">
  <span class="label">{config.label}</span>
  <div class="centeredRight">
    <table>
      {#each vOptions as v}
        <tr>
          {#each hOptions as h}
            <td class="{h === 'l' ? 'leftCell' : ''} {v === 't' ? 'topCell' : ''}">
              <input
                type="radio"
                name="{randomId}-{config.componentId}"
                bind:group="{$valStore}"
                value="{v}{h}"
              />
            </td>
          {/each}
        </tr>
      {/each}
    </table>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .centeredRight {
    flex-grow: 1;
  }

  table {
    display: inline-block;
    border-collapse: collapse;
    margin-right: 1em;
    margin-bottom: 1em;
    pointer-events: none;
  }

  td {
    position: relative;
    border: 1px solid grey;
    width: 1em;
    height: 1em;
  }

  td input {
    position: absolute;
    bottom: -0.4em;
    right: -0.4em;

    pointer-events: all;
  }

  .leftCell {
    border-left: none;
    border-top: none;
    border-bottom: none;
  }

  .topCell {
    border-top: none;
    border-left: none;
    border-right: none;
  }

  input[type="radio"] {
    border: none;

    min-width: 0.8em;
    min-height: 0.8em;
    max-width: 0.8em;
    max-height: 0.8em;
    accent-color: #f43e5c;

    outline: none;
  }

  .label {
    float: left;
    margin-left: 0.4em;
  }
</style>
