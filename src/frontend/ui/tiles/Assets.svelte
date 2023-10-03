<script lang="ts">
  import type { CacheUUID } from "@shared/types/cache";
  import { cacheStore } from "../../lib/stores/CacheStore";
  import {
    faBacon,
    faBowlRice,
    faBurger,
    faCandyCane,
    faCarrot,
    faCoffee,
    faCookieBite,
    faFish,
    faHotdog,
    faIceCream,
    faLemon,
    faPizzaSlice,
  } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
  import { toastStore } from "../../lib/stores/ToastStore";
  import { projectsStore } from "../../lib/stores/ProjectStore";

  let selectedCacheItems: CacheUUID[] = [];
  // Not used at the moment
  let controlKeyDown = false;

  const noContentIcons = [
    faBacon,
    faBowlRice,
    faBurger,
    faCandyCane,
    faCarrot,
    faCoffee,
    faCookieBite,
    faFish,
    faHotdog,
    faIceCream,
    faLemon,
    faPizzaSlice,
  ];

  function getNoContentIcon() {
    return noContentIcons[Math.floor(Math.random() * noContentIcons.length)];
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      controlKeyDown = true;
    }
  }

  function handleItemOnClick(id: CacheUUID) {
    if (selectedCacheItems.includes(id)) {
      selectedCacheItems = selectedCacheItems.filter((item) => item !== id);
    } else {
      selectedCacheItems = [...selectedCacheItems, id];
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.metaKey) {
      controlKeyDown = false;
    }
  }

  async function requestFileAccess() {
    try {
      const handle = await window.showOpenFilePicker();
      const file = await handle[0].getFile();
      const blob = await file.arrayBuffer();

      const cacheId = await cacheStore.addCacheObject(new Blob([blob], { type: file.type }), {
        name: file.name,
        contentType: file.type,
      });
      if ($projectsStore.activeProject && cacheId) {
        const res = await window.apis.projectApi.addCacheObjects($projectsStore.activeProject.id, [
          cacheId,
        ]);

        if (!res.success) {
          toastStore.trigger({ message: res.data, type: "error" });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const blobs: { [key: CacheUUID]: { blob: Blob; url: string } } = {};

  async function exportAssets() {
    if (selectedCacheItems.length === 0) {
      toastStore.trigger({ message: "No asset selected.", type: "warn" });
      return;
    }

    await cacheStore.exportCache(selectedCacheItems);
  }

  async function removeAssets() {
    if (selectedCacheItems.length === 0) {
      toastStore.trigger({ message: "No asset selected.", type: "warn" });
      return;
    }
    if ($projectsStore.activeProject) {
      const res = await window.apis.projectApi.removeCacheObjects(
        $projectsStore.activeProject.id,
        selectedCacheItems
      );

      if (!res.success) {
        toastStore.trigger({ message: res.data, type: "error" });
      }
    }
    await cacheStore.deleteSelectedAssets(selectedCacheItems);
  }

  // let barrier = 0;
  async function getBlobURL(uuid: CacheUUID, type: string): Promise<string> {
    if (blobs[uuid]) return blobs[uuid].url;

    // await new Promise((res) => { setTimeout(res, 100*barrier++) });

    const blob = new Blob([await cacheStore.get(uuid)], { type });
    const url = URL.createObjectURL(blob);
    blobs[uuid] = { blob, url }; // Memoize

    return url;
  }

  let cacheIds = projectsStore.getReactiveActiveProjectCacheIds();
</script>

{#if $projectsStore.activeProject}
  <div class="fullPane {$cacheIds.length > 0 ? 'overflow-auto' : ''} select-none">
    {#if $cacheIds.length > 0}
      <div class="itemsBox">
        {#each $cacheIds as cacheId}
          {#if $cacheStore[cacheId] && ["image/png", "image/jpeg"].includes($cacheStore[cacheId].contentType)}
            <div
              class="item thumbItem {selectedCacheItems.includes(cacheId)
               
              ? 'ring-2 ring-primary-500'
             
                : ''}"
              on:click|stopPropagation="{() => handleItemOnClick(cacheId)}"
              on:keydown="{null}"
            >
              {#await getBlobURL(cacheId, $cacheStore[cacheId].contentType) then src}
                <div class="thumbnail">
                  <img src="{src}" alt="Cached Image {cacheId.slice(0, 8)}" width="50px" />
                </div>
              {:catch error}
                <div class="thumbErr">error: {error.message}</div>
              {/await}
              <div class="itemTitle">{$cacheStore[cacheId].name ?? "-"}</div>
              <div class="itemType">{$cacheStore[cacheId].contentType}</div>
            </div>
          {:else}
            <div
              class="item {selectedCacheItems.includes(cacheId) ? 'ring-2 ring-primary-500' : ''}"
              on:click|stopPropagation="{() => handleItemOnClick(cacheId)}"
              on:keydown="{null}"
            >
              <div>{cacheId.slice(0, 8)}</div>
              <div class="itemTitle">{$cacheStore[cacheId] ? $cacheStore[cacheId].name : "-"}</div>
              <div class="itemType">
                {$cacheStore[cacheId] ? $cacheStore[cacheId].contentType : "-"}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <div class="placeholder">
        <div class="icon"><Fa icon="{getNoContentIcon()}" style="display: inline-block" /></div>
        <h1>No assets!</h1>
        <h2>Add an Asset to start editing</h2>
      </div>
    {/if}

    <div class="hover flex items-center space-x-2">
      <div
        on:click="{requestFileAccess}"
        on:keydown="{null}"
        class="flex h-7 select-none flex-nowrap items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/80 p-2 text-zinc-400 hover:bg-zinc-700 active:bg-zinc-800/50"
      >
        Add
      </div>
      <div
        on:click="{exportAssets}"
        on:keydown="{null}"
        class="flex h-7 select-none flex-nowrap items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/80 p-2 text-zinc-400 hover:bg-zinc-700 active:bg-zinc-800/50"
      >
        Export
      </div>
      <div
        on:click="{removeAssets}"
        on:keydown="{null}"
        class="flex h-7 select-none flex-nowrap items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/80 p-2 text-zinc-400 hover:bg-zinc-700 active:bg-zinc-800/50"
      >
        Remove
      </div>
    </div>
  </div>
{/if}

<svelte:window
  on:click="{() => {
    selectedCacheItems = [];
  }}"
  on:keydown="{handleKeyDown}"
  on:keyup="{handleKeyUp}"
/>

<style lang="scss">
  .fullPane {
    margin: 0px;
    width: 100%;
    height: 100%;
  }

  .hover {
    position: absolute;
    bottom: 1em;
    left: 1em;
    color: black;
    z-index: 100;
  }

  .exportButton {
    font-size: 0.6em;
    height: 20px;
    width: 50%;
    margin-left: auto;
    margin-right: auto;
  }

  .itemsBox {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    width: calc(100% - 4em);
    margin: auto;
    margin-top: 2em;
    margin-bottom: 3em;
    overflow: auto;
  }

  .item {
    display: grid;
    grid-template-rows: 55% 15% 15% 15%;
    width: 120px;
    height: 130px;
    min-width: 100px;
    min-height: 100px;
    border: 1px solid #2a2a3f;
    overflow: visible;
    margin: 0.4em;
    padding: 0.2em;
    border-radius: 10px;
    text-align: center;
  }

  .item:hover {
    background-color: #2a2a3f88;
  }

  .thumbnail {
    text-align: center;
  }

  .thumbnail img {
    height: 100%;
    width: auto;
    margin: auto;
    border-radius: 2px;
  }

  .itemTitle,
  .itemType {
    font-size: 0.6em;
    text-overflow: ellipsis;
    overflow: hidden;
    word-wrap: break-word;
    text-wrap: nowrap;
    white-space: nowrap;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    h1 {
      font-size: 1.5em;
      color: #a8a8be;
      margin-bottom: 0.2em;
    }

    .icon {
      width: 100%;
      color: #9090a4;
      font-size: 5em;
      line-height: 1em;
      margin-bottom: 0.1em;
    }

    h2 {
      font-size: 0.8em;
      color: #9090a4;
    }
  }

  /* Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 14px;
    margin: 0;
  }

  *::-webkit-scrollbar-thumb {
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    border-radius: 9999px;
    background-color: #52525b;
  }
</style>
