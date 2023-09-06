<script lang="ts">
  import type { TileUILeaf, TileUI, UIComponentConfig } from "../../../../shared/ui/TileUITypes";
  import TileUIComponent from "./TileUIComponent.svelte";
  // import type { UIValueStore } from "@shared/ui/UIGraph";
  // import { writable } from "svelte/store";
  // import { ColorPicker, RadioGroup, type CSSColorString } from "blix_svelvet";

  export let ui: TileUI | null = null;
  export let uiConfigs: { [key: string]: UIComponentConfig };

  // const colorPicker = writable("red" as CSSColorString);
  // const radio = writable("a");

  function toLeafRepresentation(ui: TileUI): TileUILeaf | null {
    if (ui.type === "leaf") {
      return ui as TileUILeaf;
    }
    return null;
  }
</script>

{#if ui}
  {#if ui.type === "parent"}
    <ul>
      {#each ui.params as child}
        <li class="component">
          <svelte:self ui="{child}" uiConfigs="{uiConfigs}" />
        </li>
      {/each}
    </ul>
  {:else if ui.type === "leaf"}
    <p>
      <TileUIComponent leafUI="{toLeafRepresentation(ui)}" uiConfigs="{uiConfigs}" />
    </p>
  {/if}
{/if}

<style>
  .component {
    text-align: center;
    padding: 10px 0px;
  }
</style>
