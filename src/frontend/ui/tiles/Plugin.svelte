<script lang="ts">
  import { tileStore } from "../../lib/stores/TileStore";

  export let signature: string;

  $: tile = tileStore.getTileReactive(signature);
</script>

<div class="header">
  <h1>{$tile.name}</h1>
</div>

<style>
</style>
