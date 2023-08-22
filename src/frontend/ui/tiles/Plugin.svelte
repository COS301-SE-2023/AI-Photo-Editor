<script lang="ts">
  import { tileStore } from "../../lib/stores/TileStore";
  import PluginTile from "../utils/PluginTile.svelte";

  export let signature: string;

  const tile = tileStore.getTileReactive(signature);
  // console.log("signature", signature);
</script>

<PluginTile componentUI="{$tile.ui}" />
