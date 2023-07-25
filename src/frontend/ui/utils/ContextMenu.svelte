<script lang="ts">
  // import { graphNodeMenuStore } from "../../lib/stores/ContextMenuStore";
  import type { ItemGroup, Item } from "../../lib/stores/ContextMenuStore";
  import ContextMenuItem from "./ContextMenuItem.svelte";
  import ContextMenuGroup from "./ContextMenuGroup.svelte";

  const searchPlaceholder = "Search for nodes...";
  let searchTerm = "";

  let items: (ItemGroup | Item)[] = [
    {
      label: "Blix",
      items: [
        { label: "Brightness", action: { type: "addNode", signature: "brightness" } },
        { label: "Hue", action: { type: "addNode", signature: "hue" } },
        { label: "Rotate", action: { type: "addNode", signature: "rotate" } },
        { label: "Crop", action: { type: "addNode", signature: "crop" } },
      ],
    },
    // {
    //   label: "Test",
    //   action: {type: "addNode", signature: "test"}
    // },
    {
      label: "Pillow",
      items: [
        { label: "Rotate", action: { type: "addNode", signature: "rotate" } },
        { label: "Crop", action: { type: "addNode", signature: "crop" } },
        { label: "Brightness", action: { type: "addNode", signature: "brightness" } },
        { label: "Hue", action: { type: "addNode", signature: "hue" } },
      ],
    },
  ];

  // function filter(items: (ItemGroup | Item)[], str: string) {
  //   return items.forEach((item) => {
  //     // if ("items" in item) {
  //     //   const filtered = items.
  //     // }
  //   });
  // }
</script>

{#if true}
  <div>
    <section
      class="fixed z-50 flex h-64 w-48 flex-col items-center overflow-hidden rounded-lg bg-zinc-800/80 ring-2 ring-zinc-600 backdrop-blur-md"
    >
      <section class="flex items-center border-b-2 border-zinc-500 p-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-6 w-6 stroke-zinc-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
        </svg>
        <input
          type="text"
          placeholder="{searchPlaceholder}"
          bind:value="{searchTerm}"
          class="text-md mr-auto h-7 w-full border-none bg-transparent p-2 text-zinc-200 caret-purple-300 outline-none"
        />
      </section>
      <section class="flex w-full select-none flex-col overflow-y-auto p-1">
        <ul>
          {#each items as item (item)}
            {#if "items" in item}
              <ContextMenuGroup group="{item}" />
            {:else}
              <ContextMenuItem item="{item}" />
            {/if}
          {/each}
        </ul>
      </section>
    </section>
  </div>

  <!-- <div
    class="fixed inset-x-0 z-50 h-32 w-32 bg-red-500"
    style:top="{$graphNodeMenuStore.windowPos.y}px"
    style:left="{$graphNodeMenuStore.windowPos.x}px"
  >
    Jake: [{$graphNodeMenuStore.windowPos.x}][{$graphNodeMenuStore.windowPos
      .y}][{$graphNodeMenuStore.isShowing}]
  </div> -->
{/if}

<style lang="postcss">
  /* Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 11px;
    margin: 0;
  }

  *::-webkit-scrollbar-thumb {
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    border-radius: 9999px;
    background-color: #52525b;
  }
</style>
