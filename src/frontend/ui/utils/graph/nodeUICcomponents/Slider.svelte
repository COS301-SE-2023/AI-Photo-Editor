<script lang="ts">
  import { writable } from "svelte/store";
  import { Slider } from "blix_svelvet";

  const slider = writable(0);
</script>

<Slider parameterStore="{slider}" min="{1}" max="{12}" fixed="{1}" step="{0.1}" />
