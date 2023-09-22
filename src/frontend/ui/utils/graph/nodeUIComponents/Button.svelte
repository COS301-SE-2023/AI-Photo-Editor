<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable(0);
</script>

<button class="p-1 px-2">{config.label}</button>
