<script lang="ts">
  import { writable } from "svelte/store";
  import { ColorPicker, type CSSColorString } from "blix_svelvet";
  import { UIValueStore } from "@shared/ui/UIGraph";

  export let inputStore: UIValueStore;
  if (!inputStore.inputs["colorPicker"])
    inputStore.inputs["colorPicker"] = writable("#BEEF69" as CSSColorString);
</script>

<ColorPicker parameterStore="{inputStore.inputs['colorPicker']}" />
