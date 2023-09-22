<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  let filePicker: HTMLInputElement;

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable("");

  $: valStore = inputStore.inputs[config.componentId];

  let files: FileList | undefined;

  $: if (files) {
    valStore.set(files[0]?.path ?? $valStore);
  } else {
    // valStore.set("");
  }
</script>

<input type="file" class="filePicker" bind:files="{files}" bind:this="{filePicker}" />
<label
  ><input
    type="button"
    value="Browse..."
    on:click="{() => {
      filePicker.click();
    }}"
  />
  {$valStore}</label
>

<style>
  .filePicker {
    display: none;
  }

  input {
    padding: 0.2em;
  }

  label {
    max-width: 20em;
    padding: 0.2em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
