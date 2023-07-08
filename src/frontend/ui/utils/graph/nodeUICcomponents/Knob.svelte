<script lang="ts">
  import { writable } from "svelte/store";
  import { Knob } from "svelvet";
  const knob = writable(0);
</script>

<Knob parameterStore="{knob}" />
