<script lang="ts">
  import { UIValueStore } from "@shared/ui/UIGraph";
  import { blixStore } from "../../../../lib/stores/BlixStore";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import { createEventDispatcher } from "svelte";
  import { projectsStore } from "@frontend/lib/stores/ProjectStore";
  import { writable, type Writable } from "svelte/store";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;
  export let projectId: string;

  let selectedCacheId = writable("");

  const cacheObjects = projectsStore.getReactiveProjectCacheMap(projectId);
  const dispatch = createEventDispatcher();

  if (!inputStore.inputs[config.componentId]) {
    inputStore.inputs[config.componentId] = selectedCacheId;
  } else {
    selectedCacheId = inputStore.inputs[config.componentId] as Writable<string>;
  }

  $: if (cacheObjects && $cacheObjects.size && !$selectedCacheId) {
    $selectedCacheId = Array.from($cacheObjects.keys())[0];
  }

  $: if (cacheObjects && !$cacheObjects.has($selectedCacheId)) {
    $selectedCacheId = "";
  }

  function handleInputInteraction() {
    dispatch("inputInteraction", { id: config.componentId, value: selectedCacheId });
  }
</script>

{#if $cacheObjects.size}
  {#key inputStore.inputs[config.componentId]}
    <select bind:value="{$selectedCacheId}" on:change="{handleInputInteraction}">
      {#each Array.from($cacheObjects) as [cacheId, cacheMetadata]}
        {#if !$blixStore.production}
          <option value="{cacheId}">
            {cacheMetadata.name} [{cacheId}] ({cacheMetadata.contentType})
          </option>
        {:else}
          <option value="{cacheId}">{cacheMetadata.name}</option>
        {/if}
      {/each}
    </select>
  {/key}
{:else}
  <select>
    <option selected disabled>Select an asset</option>
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
