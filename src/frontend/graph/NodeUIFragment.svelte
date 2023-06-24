<script type="ts">
  import { Slider, generateInput } from "svelvet";

  export let inputsStore: ReturnType<typeof generateInput> | null = null;
</script>

<!-- {#if $inputsStore?.width != undefined} -->
<!-- <div> -->
<!-- <Slider min={1} max={12} fixed={1} step={0.1} parameterStore={$inputs.width} /> -->
<!-- </div> -->
<!-- {/if} -->

<style>
</style>
