<script lang="ts">
  import {
    NodeUILeaf,
    type NodeUI,
    type UIComponentConfig,
    NodeUIComponent,
  } from "@shared/ui/NodeUITypes";
  import type { UIValueStore } from "@shared/ui/UIGraph";
  import NodeUiComponent from "./NodeUIComponent.svelte";
  import { blixStore } from "../../../lib/stores/BlixStore";
  import { get } from "svelte/store";

  export let ui: NodeUI | null = null;
  export let inputStore: UIValueStore;
  export let uiConfigs: { [key: string]: UIComponentConfig };
  // const dispatch = createEventDispatcher();
  // export let nodeId: UUID;

  // const colorPicker = writable("red" as CSSColorString);
  // const radio = writable("a");

  function toLeafRepresentation(ui: NodeUI): NodeUILeaf | null {
    if (ui.type === "leaf") {
      return ui as NodeUILeaf;
    }
    return null;
  }

  /** For production */
  function shouldBeHidden(leaf: NodeUILeaf | null) {
    if (!get(blixStore).production) return false;

    if (!leaf) return false;

    const hiddenCategories: NodeUIComponent[] = [
      NodeUIComponent.Buffer,
      NodeUIComponent.TweakDial,
      NodeUIComponent.DiffDial,
    ];

    return hiddenCategories.includes(leaf?.category as NodeUIComponent);
  }
</script>

{#if ui}
  {#if ui.type === "parent"}
    <ul>
      {#each ui.params as child}
        <li class="component">
          <svelte:self
            on:inputInteraction
            inputStore="{inputStore}"
            ui="{child}"
            uiConfigs="{uiConfigs}"
          />
        </li>
      {/each}
    </ul>
  {:else if ui.type === "leaf"}
    <p class="{shouldBeHidden(toLeafRepresentation(ui)) ? 'hidden' : ''}">
      <NodeUiComponent
        inputStore="{inputStore}"
        leafUI="{toLeafRepresentation(ui)}"
        uiConfigs="{uiConfigs}"
        on:inputInteraction
      />
    </p>
  {/if}
{/if}

<style>
  .component {
    text-align: center;
    padding: 10px 0px;
  }
</style>
