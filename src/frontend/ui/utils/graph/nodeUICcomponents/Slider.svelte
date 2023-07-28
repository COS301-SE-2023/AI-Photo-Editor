<script lang="ts">
  import { writable } from "svelte/store";
  import { Slider } from "blix_svelvet";
  import { UIValueStore } from "@shared/ui/UIGraph";

  export let inputStore: UIValueStore;
  if (!inputStore.inputs["slider"]) inputStore.inputs["slider"] = writable(0);
</script>

<Slider
  parameterStore="{inputStore.inputs['slider']}"
  min="{1}"
  max="{12}"
  fixed="{1}"
  step="{0.1}"
/>
