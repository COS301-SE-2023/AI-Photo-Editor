<script lang="ts">
  import { writable } from "svelte/store";
  import { Slider } from "blix_svelvet";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  const { min, max, step } = props as { min: number; max: number; step: number };

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable(0);

  $: valStore = inputStore.inputs[config.componentId];
</script>

<Slider
  parameterStore="{valStore}"
  min="{min}"
  max="{max}"
  step="{step}"
  fixed="{1}"
  bgColor="#1F1F28"
  barColor="#f43e5c"
  label="{config.label}"
/>
