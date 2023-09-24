<script lang="ts">
  import { writable } from "svelte/store";
  import { Knob } from "blix_svelvet";
  import type { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  const { min, max, step } = props as { min: number; max: number; step: number };

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable(0);
</script>

<div class="knob">
  <Knob
    parameterStore="{inputStore.inputs[config.componentId]}"
    min="{min}"
    max="{max}"
    step="{step}"
    label="{config.label}"
    knobColor="#1F1F28"
  />
</div>

<style>
  .knob {
    margin: auto;
    width: min-content;
    height: min-content;
  }
</style>
