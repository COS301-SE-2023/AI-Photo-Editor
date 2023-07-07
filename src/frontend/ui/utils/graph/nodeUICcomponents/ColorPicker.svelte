<script lang="ts">
  import { writable } from "svelte/store";
  import { ColorPicker, type CSSColorString } from "svelvet";

  const colorPicker = writable("red" as CSSColorString);
</script>

<ColorPicker parameterStore="{colorPicker}" />
