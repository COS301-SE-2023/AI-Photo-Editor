<script lang="ts">
  import { writable } from "svelte/store";
  import { Slider } from "blix_svelvet";
  import { UIValueStore } from "@shared/ui/UIGraph";

  export let label: string;
  export let inputStore: UIValueStore;
  $: console.log(inputStore);

  if (!inputStore.inputs[label]) inputStore.inputs[label] = writable(0);
</script>

<Slider parameterStore="{inputStore.inputs[label]}" min="{1}" max="{12}" fixed="{1}" step="{0.1}" />
