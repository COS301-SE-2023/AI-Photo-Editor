<script lang="ts">
  // import { writable } from "svelte/store";
  // import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  // export let inputStore: UIValueStore;
  export let config: UIComponentConfig;
  console.log("config", config);

  // if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable(0);
</script>

<button class="p-1 px-2" style="height: 50px; width: 50px; font-size:small; text-align:center"
  >{config.label}</button
>
