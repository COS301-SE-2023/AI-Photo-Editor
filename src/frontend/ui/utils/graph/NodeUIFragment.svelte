<script lang="ts">
  import { NodeUILeaf, type NodeUI } from "@shared/ui/NodeUITypes";
  import type { AnchorValueStore } from "@shared/ui/UIGraph";
  import NodeUiComponent from "./NodeUIComponent.svelte";
  // import { writable } from "svelte/store";
  // import { ColorPicker, RadioGroup, type CSSColorString } from "blix_svelvet";

  export let ui: NodeUI | null = null;
  export let inputStore: AnchorValueStore;

  // const colorPicker = writable("red" as CSSColorString);
  // const radio = writable("a");

  function toLeafRepresentation(ui: NodeUI): NodeUILeaf | null {
    if (ui.type === "leaf") {
      return ui as NodeUILeaf;
    }
    return null;
  }
</script>

{#if ui}
  {#if ui.type === "parent"}
    <ul>
      {#each ui.params as child}
        <li class="component">
          <svelte:self {inputStore} ui="{child}" />
        </li>
      {/each}
    </ul>
  {:else if ui.type === "leaf"}
    <p>
      <NodeUiComponent {inputStore} leafUI="{toLeafRepresentation(ui)}" />
    </p>
  {/if}
{/if}

<style>
  .component {
    text-align: center;
    padding: 10px 0px;
  }
</style>
