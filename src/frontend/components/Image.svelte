<script lang="ts">
  import { onMount } from "svelte";
  // import processor from "./Graph/Brightness.svelte"

  export let src: string;

  let loadState = "loaded";

  onMount(() => {
    const img = new Image();
    img.src = src;
    loadState = "loading";

    img.onload = () => {
      loadState = "loaded";
    };
    img.onerror = () => {
      loadState = "failed";
    };
  });
</script>

{#if loadState == "loaded"}
  <img src="{src}" alt="Document" class="test" style="filter: brightness(0.8);"/>
{:else if loadState == "failed"}
  <img src="" alt="Not Found" />
{:else if loadState == "loading"}
  <img src="" alt="Loading..." />
{/if}
