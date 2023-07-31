<script lang="ts">
  import { writable } from "svelte/store";
  import { ColorPicker, type CSSColorString } from "blix_svelvet";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  if (!inputStore.inputs[config.componentId])
    inputStore.inputs[config.componentId] = writable("#BEEF69" as CSSColorString);
</script>

<div class="picker">
  <ColorPicker parameterStore="{inputStore.inputs[config.componentId]}" />
</div>

<style>
  .picker {
    margin: auto;
    width: min-content;
    height: min-content;
  }
</style>
