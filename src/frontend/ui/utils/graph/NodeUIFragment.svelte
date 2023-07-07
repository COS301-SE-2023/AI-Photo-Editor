<script lang="ts">
  import { NodeUILeaf, type NodeUI } from "@shared/ui/NodeUITypes";
  import NodeUiComponent from "./NodeUIComponent.svelte";
  // import { writable } from "svelte/store";
  // import { ColorPicker, RadioGroup, type CSSColorString } from "svelvet";

  export let ui: NodeUI | null = null;

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
          <svelte:self ui="{child}" />
        </li>
      {/each}
    </ul>
  {:else if ui.type === "leaf"}
    <p>
      <NodeUiComponent leafUI="{toLeafRepresentation(ui)}" />
    </p>
  {/if}
{/if}

<style>
  .component {
    text-align: center;
    padding: 10px 0px;
  }
</style>
