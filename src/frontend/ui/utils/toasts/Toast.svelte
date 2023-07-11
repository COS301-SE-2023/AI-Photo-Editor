<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { ToastOptions } from "../../../lib/stores/ToastStore";

  const dispatch = createEventDispatcher();

  export let message: string;
  export let type: ToastOptions["type"];
  export let freezable: boolean;
  export let hovered: boolean;

  let iconColors: string;

  if (type === "success") {
    iconColors = "bg-green-800 text-green-200";
  } else if (type === "error") {
    iconColors = "bg-red-800 text-red-200";
  } else if (type === "warn") {
    iconColors = "bg-orange-700 text-orange-200";
  } else if (type === "info") {
    iconColors = "bg-blue-800 text-blue-200";
  }
</script>

<div
  class="mb-r flex w-full max-w-sm items-center rounded-lg bg-zinc-800 p-3 text-zinc-400 shadow ring-2 ring-zinc-400 {hovered &&
  freezable
    ? 'scale-[101%]'
    : ''}"
  role="alert"
>
  <div
    class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg {iconColors}"
  >
    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      {#if type === "success"}
        <path
          d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
        ></path>
      {:else if type === "error"}
        <path
          d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"
        ></path>
      {:else if type === "warn"}
        <path
          d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"
        ></path>
      {:else if type === "info"}
        <path
          d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
        ></path>
      {/if}
    </svg>
  </div>
  <div class="ml-3 text-sm font-normal">{message}</div>
  <button
    type="button"
    class="-mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border-none bg-zinc-800 p-1.5 text-zinc-500 hover:bg-zinc-700 hover:text-white focus:ring-2 focus:ring-gray-300"
    aria-label="Close"
    on:click="{() => dispatch('dismiss')}"
  >
    <span class="sr-only">Close</span>
    <svg
      class="h-3 w-3"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"></path>
    </svg>
  </button>
</div>
