<script lang="ts">
  import { writable } from "svelte/store";
  import { Knob } from "blix_svelvet";
  import type { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable(0);
</script>

<Knob parameterStore="{inputStore.inputs[config.componentId]}" />
