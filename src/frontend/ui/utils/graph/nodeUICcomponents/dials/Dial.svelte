<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import type { NodeTweakData } from "@shared/types";
  import { faParagraph, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  export let icon: IconDefinition = faParagraph;

  if (!inputStore.inputs[config.componentId])
    inputStore.inputs[config.componentId] = writable<NodeTweakData>({
      nodeUUID: "",
      inputs: [] as string[],
    });

  $: valStore = inputStore.inputs[config.componentId];

  let mouseover = false;
</script>

<div
  class="dial"
  on:mouseenter="{() => (mouseover = true)}"
  on:mouseleave="{() => (mouseover = false)}"
>
  <Fa icon="{icon}" />
  {#if mouseover}
    <div class="popup">
      {JSON.stringify($valStore)}
    </div>
  {/if}
</div>

<style>
  .dial {
    display: inline-block;
    position: relative;
    margin: 0px;

    width: 2em;
    height: 1.2em;
    background-color: #1f1f28;
    border: 2px solid #2f2f3f;
    border-radius: 0.6em;
    padding-left: 0.235em;

    text-align: center;
  }

  .popup {
    position: absolute;
    left: -9.2em;
    z-index: 1000;

    max-width: 20em;
    background-color: #1f1f28;
    border: 2px solid #2f2f3f;
    text-align: center;
    overflow-wrap: break-word;
  }
</style>
