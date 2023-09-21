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

  async function getBlobURL(uuid: CacheUUID, type: string): Promise<string> {
    if (blobs[uuid]) return blobs[uuid].url;

    const blob = new Blob([await cacheStore.get(uuid)], { type });
    const url = URL.createObjectURL(blob);
    blobs[uuid] = { blob, url }; // Memoize

    return url;
  }
</script>

<div class="fullPane">
  <div>
    <table>
      <tr>
        <th>Cache Id</th>
        <th>Name</th>
        <th>Type</th>
        <th>Content</th>
      </tr>
      {#each Object.keys($cacheStore) as uuid}
        <tr>
          <td>{uuid.slice(0, 8)}</td>
          <td>{$cacheStore[uuid].name ?? "-"}</td>
          <td>{$cacheStore[uuid].contentType}</td>
          {#if ["image/png", "image/jpeg"].includes($cacheStore[uuid].contentType)}
            {#await getBlobURL(uuid, $cacheStore[uuid].contentType) then src}
              <td>
                <img src="{src}" alt="Cached Image {uuid.slice(0, 8)}" width="50px" />
              </td>
            {:catch error}
              <td>error: {error.message}</td>
            {/await}
          {/if}
        </tr>
      {/each}
    </table>
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

  table {
    width: calc(100% - 8em);
    margin: 4em auto;
  }

  table,
  td,
  th {
    border: 1px solid white;
    border-collapse: collapse;
    padding: 0.4em;
  }
</style>
