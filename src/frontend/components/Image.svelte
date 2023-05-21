<script lang="ts">
  import { onMount } from "svelte";
  // import processor from "./Graph/Brightness.svelte"
  // import { brightness } from "../stores/graphStore";

  export let src: string;
  let ref: HTMLInputElement;
  src = '';

  let loadState = "failed";

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

  function test() {
    console.log(ref.value)
  }

  // let currentBrightness = 0;

  // const unsubscribe = brightness.subscribe((value) => {
  //   currentBrightness = value;
  //   console.log("Current brightness:", currentBrightness);
  // });

  // onDestroy(() => {
  //   unsubscribe();
  // });
</script>

{#if loadState == "failed"}
  <div class="flex items-center justify-center w-full">
    <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-bray-800 bg-zinc-700 border-zinc-600 hover:border-zinc-500 hover:bg-zinc-600">
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg aria-hidden="true" class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p class="mb-2 text-sm text-zinc-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
            <p class="text-xs text-zinc-400">SVG, PNG, JPG</p>
        </div>
        <input id="dropzone-file" type="file" class="hidden" bind:this={ref} on:change={test}/>
    </label>
  </div> 
{:else}
  {#if loadState == "loaded"}
    <img src="{src}" alt="Document" class="test" style="filter: brightness(0.8);" />
  {:else if loadState == "failed"}
    <img src="" alt="Not Found" />
  {:else if loadState == "loading"}
    <img src="" alt="Loading..." />
  {/if}
{/if}

