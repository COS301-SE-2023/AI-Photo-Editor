<script lang="ts">
  import type { CacheUUID } from "@shared/types/cache";
  import { cacheStore } from "../../lib/stores/CacheStore";

  async function requestFileAccess() {
    try {
      const handle = await window.showOpenFilePicker();
      const file = await handle[0].getFile();
      const blob = await file.arrayBuffer();

      cacheStore.addCacheObject(new Blob([blob], { type: file.type }), {
        name: file.name,
        contentType: file.type,
      });
    } catch (error) {
      console.error(error);
    }
  }

  const blobs: { [key: CacheUUID]: { blob: Blob; url: string } } = {};

  // let barrier = 0;
  async function getBlobURL(uuid: CacheUUID, type: string): Promise<string> {
    if (blobs[uuid]) return blobs[uuid].url;

    // await new Promise((res) => { setTimeout(res, 100*barrier++) });

    const blob = new Blob([await cacheStore.get(uuid)], { type });
    const url = URL.createObjectURL(blob);
    blobs[uuid] = { blob, url }; // Memoize

    return url;
  }
</script>

<div class="fullPane">
  <div>
    <div class="itemsBox">
      {#each Object.keys($cacheStore) as uuid}
        {#if ["image/png", "image/jpeg"].includes($cacheStore[uuid].contentType)}
          <div class="item thumbItem">
            {#await getBlobURL(uuid, $cacheStore[uuid].contentType) then src}
              <div class="thumbnail">
                <img src="{src}" alt="Cached Image {uuid.slice(0, 8)}" width="50px" />
              </div>
            {:catch error}
              <div class="thumbErr">error: {error.message}</div>
            {/await}
            <div class="itemTitle">{$cacheStore[uuid].name ?? "-"}</div>
            <div class="itemType">{$cacheStore[uuid].contentType}</div>
          </div>
        {:else}
          <div class="item">
            <div>{uuid.slice(0, 8)}</div>
            <div class="itemTitle">{$cacheStore[uuid].name ?? "-"}</div>
            <div class="itemType">{$cacheStore[uuid].contentType}</div>
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <div class="hover flex items-center space-x-2">
    <div
      on:click="{requestFileAccess}"
      on:keydown="{null}"
      class="flex h-7 select-none items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/80 p-2 text-zinc-400 hover:bg-zinc-700 active:bg-zinc-800/50"
    >
      Add Asset
    </div>
  </div>
</div>

<style>
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

  .itemsBox {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    width: calc(100% - 4em);
    margin: auto;
    margin-top: 2em;
    overflow: auto;
  }

  .item {
    display: grid;
    grid-template-rows: 70% 15% 15%;
    width: 100px;
    height: 100px;
    min-width: 100px;
    min-height: 100px;
    border: 1px solid #2a2a3f;
    overflow: hidden;
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
</style>
