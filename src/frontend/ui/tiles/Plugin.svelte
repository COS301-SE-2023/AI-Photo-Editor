<script lang="ts">
  import { tileStore } from "../../lib/stores/TileStore";
  import PluginTile from "../utils/pluginTile/PluginTile.svelte";

  export let signature: string;

  const tile = tileStore.getTileReactive(signature);
  console.log("signature", $tile);
</script>

<PluginTile componentUI="{$tile.ui}" uiConfigs="{$tile.uiConfigs}" />
