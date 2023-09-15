<script lang="ts">
  import { cacheStore } from "../../lib/stores/CacheStore";

  function addAsset() {}
</script>

<div>
  <ul>
    {#each $cacheStore as id}
      <li>
        <span>{id}</span>
      </li>
    {/each}
  </ul>
</div>
<button on:click="{addAsset}"> Add asset </button>

<style>
  button {
    position: absolute;
    z-index: 10;
    bottom: 1em;
    right: 1em;
  }
</style>
