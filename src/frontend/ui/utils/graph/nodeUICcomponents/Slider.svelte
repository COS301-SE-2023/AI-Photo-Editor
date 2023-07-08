<script lang="ts">
  import { writable } from "svelte/store";
  import { Slider } from "svelvet";

  const slider = writable(0);
</script>

<Slider parameterStore="{slider}" min="{1}" max="{12}" fixed="{1}" step="{0.1}" />
