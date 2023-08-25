<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  let db;
  const request = indexedDB.open("blix-ui", 1);

  request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
    db = event?.target?.result;
    db.createObjectStore("images", {
      keyPath: "id",
    });
  };
  request.onsuccess = function (event: Event) {
    db = event?.target?.result;
  };
  request.onerror = function (event: Event) {
    console.error("IndexedDB error: " + event?.target?.errorCode);
  };

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable("");

  $: valStore = inputStore.inputs[config.componentId];

  let files: FileList | undefined;

  $: if (files) {
    valStore.set(files[0].path);
  } else {
    valStore.set("");
  }
</script>

<input type="file" bind:files="{files}" />

<style>
  input {
    color: #cdd6f4;
    background-color: #1f1f28;
    border: none;
    padding: 0.1em;
  }
</style>
