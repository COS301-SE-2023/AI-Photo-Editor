<script lang="ts">
  import { writable } from "svelte/store";
  import { Slider } from "blix_svelvet";
  import { AnchorValueStore } from "@shared/ui/UIGraph";

  export let inputStore: AnchorValueStore;
  if (!inputStore.inputs["slider"]) inputStore.inputs["slider"] = writable(0);
</script>

<Slider
  parameterStore="{inputStore.inputs['slider']}"
  min="{1}"
  max="{12}"
  fixed="{1}"
  step="{0.1}"
/>
