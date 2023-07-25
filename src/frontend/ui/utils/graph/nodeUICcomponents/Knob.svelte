<script lang="ts">
  import { writable } from "svelte/store";
  import { Knob } from "blix_svelvet";
  import type { AnchorValueStore } from "@shared/ui/UIGraph";

  export let inputStore: AnchorValueStore;
  if (!inputStore.inputs["knob"]) inputStore.inputs["knob"] = writable(0);
</script>

<Knob parameterStore="{inputStore.inputs['knob']}" />
