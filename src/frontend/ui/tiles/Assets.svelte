<script lang="ts">
  import { cacheStore } from "../../lib/stores/CacheStore";
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

<style>
</style>
