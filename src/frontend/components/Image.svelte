<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  // import processor from "./Graph/Brightness.svelte"
  import { brightness } from "../stores/graphStore";

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

  let currentBrightness = 0;

  const unsubscribe = brightness.subscribe((value) => {
    currentBrightness = value;
    console.log("Current brightness:", currentBrightness);
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

{#if loadState == "loaded"}
  <img src="{src}" alt="Document" class="test" style="filter: brightness({currentBrightness});" />
{:else if loadState == "failed"}
  <img src="" alt="Not Found" />
{:else if loadState == "loading"}
  <img src="" alt="Loading..." />
{/if}
