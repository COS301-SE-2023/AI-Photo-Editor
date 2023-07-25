<script lang="ts">
  import { writable } from "svelte/store";
  import { ColorPicker, type CSSColorString } from "blix_svelvet";
  import { AnchorValueStore } from "@shared/ui/UIGraph";

  export let inputStore: AnchorValueStore;
  if (!inputStore.inputs["colorPicker"])
    inputStore.inputs["colorPicker"] = writable("#BEEF69" as CSSColorString);
</script>

<ColorPicker parameterStore="{inputStore.inputs['colorPicker']}" />
