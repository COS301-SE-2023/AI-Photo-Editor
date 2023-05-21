<script lang="ts">
  import { onMount } from "svelte";
  import { graphStore } from "../stores/GraphStore";

  let ref: HTMLInputElement;
  let src = "";

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

  graphStore.subscribe((store) => {
    let data = {};

    store.nodes.forEach((n) => {
      // @ts-ignore
      data[n.id] = n.slider?.value || 0;
    });

    console.log(data);
    window.api.send("editPhoto", data);
  });
</script>

{#if loadState == "failed"}
  <div class="flex w-full items-center justify-center">
    <label
      for="dropzone-file"
      class="hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-600 bg-zinc-700 hover:border-zinc-500 hover:bg-zinc-600"
    >
      <div class="flex flex-col items-center justify-center pb-6 pt-5">
        <svg
          aria-hidden="true"
          class="mb-3 h-10 w-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path></svg
        >
        <p class="mb-2 text-sm text-zinc-400">
          <span class="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-zinc-400">SVG, PNG, JPG</p>
      </div>
      <input id="dropzone-file" type="file" class="hidden" bind:this="{ref}" />
    </label>
  </div>
{:else if loadState == "loaded"}
  <img src="{src}" alt="Document" class="test" style="filter: brightness(0.8);" />
{:else if loadState == "failed"}
  <img src="" alt="Not Found" />
{:else if loadState == "loading"}
  <img src="" alt="Loading..." />
{/if}
