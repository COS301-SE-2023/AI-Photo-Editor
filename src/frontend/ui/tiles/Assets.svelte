<script lang="ts">
  import { cacheStore } from "../../lib/stores/CacheStore";
  async function requestFileAccess() {
    try {
      const handle = await window.showOpenFilePicker();
      const file = await handle[0].getFile();
      const blob = await file.arrayBuffer();

      cacheStore.addCacheObject(new Blob([blob], { type: file.type }));
    } catch (error) {
      console.error(error);
    }
  }
</script>

<div class="fullPane">
  <div>
    <ul>
      {#each $cacheStore as id}
        <li>
          <span>{id}</span>
        </li>
      {/each}
    </ul>
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
</style>
