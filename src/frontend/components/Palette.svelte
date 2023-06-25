<script lang="ts">
  import Item from "./Item.svelte";
  import type { GraphNode, GraphSlider } from "../types";
  import { graphStore } from "../stores/GraphStore";
  import { paletteStore } from "../stores/PaletteStore";
  import { commandStore } from "../stores/CommandStore";
  import Shortcuts from "../Shortcuts.svelte";

  let showPalette = false;
  let expanded = true;
  let inputElement: HTMLInputElement;
  let searchTerm = "";

  type Category = {
    title: string;
    items: string[];
  };

  let categoryIndex = 0;
  let itemIndex = 0;

  // TODO: Change items to use the command store values directly:
  $commandStore; // Use the shorthand like this

  // TODO: Get rid of this
  const categoriesOriginals: Category[] = [
    {
      title: "Recent",
      // items: ["Brightness", "Contrast", "Saturation", "Hue", "Sharpness", "Exposure", "Shadows"],
      items: ["Brightness", "Saturation", "Hue", "Rotate", "Shadows", "Output"],
    },
    {
      title: "Favourite",
      // items: ["Import", "Export", "Clear"],
      items: $commandStore.commands.map((command) => command.split(".")[1]),
    },
  ];

  let categories = categoriesOriginals;

  function handleItemClick() {}

  function filterList(list: any[]): any[] {
    return list.filter((rowObj: any) => {
      const formattedSearchTerm = searchTerm.trim().toLowerCase() || "";
      return Object.values(rowObj).join("").toLowerCase().includes(formattedSearchTerm);
    });
  }

  function onSearch(): void {
    expanded = true;
    categoryIndex = 0;
    itemIndex = 0;
    let categoriesDeepCopy = JSON.parse(JSON.stringify(categoriesOriginals));
    categories = categoriesDeepCopy.filter((category: Category) => {
      category.items = filterList(category.items);
      if (category.items.length) return category;
      return;
    });
  }

  const shortcuts = {
    "blix.palette.toggle": () => {
      // Default mod+p
      showPalette = !showPalette;
    },
    "blix.palette.show": () => {
      showPalette = true;
    },
    "blix.palette.hide": () => {
      // Default esc
      showPalette = false;
    },
    "blix.palette.scrollDown": () => {
      // Default downArrow, ctrl+j, tab
      // handleMoveDown();
    },
    "blix.palette.scrollUp": () => {
      // Default upArrow, ctrl+k, shift+tab
      // handleMoveUp();
    },
    "blix.palette.selectItem": () => {
      // Default enter
      // handleAction();
    },
  };

  $: if (showPalette && inputElement) {
    inputElement.focus();
  }

  $: if (showPalette) {
    searchTerm = "";
    expanded = true;
    categoryIndex = 0;
    itemIndex = 0;
    categories = categoriesOriginals;
  }
</script>

{#if showPalette}
  <div
    class="fixed inset-x-0 top-48 z-50 m-auto flex w-[40%] min-w-[400px] flex-col items-center overflow-hidden rounded-xl border border-zinc-600 bg-zinc-800/80 backdrop-blur-md"
  >
    <!-- Header -->
    <header class="flex w-full items-center px-3">
      <input
        type="text"
        placeholder="Search for tools and commands..."
        class="mr-auto h-14 w-full border-none bg-transparent text-lg text-zinc-100 outline-none"
        bind:this="{inputElement}"
        bind:value="{searchTerm}"
        on:input="{onSearch}"
      />
    </header>
    <!-- Results -->
    {#if expanded && categories.length > 0}
      <div
        class="hide-scrollbar container max-h-[400px] w-full overflow-x-auto border-t border-zinc-600 p-2"
      >
        <nav>
          {#each categories as category, i}
            <div class="p4 m-1 text-xs font-semibold text-zinc-400">
              {category.title}
            </div>
            <ul>
              {#each category.items as item, j}
                <Item
                  title="{item}"
                  selected="{i == categoryIndex && j == itemIndex}"
                  on:itemClicked="{handleItemClick}"
                />
              {/each}
            </ul>
          {/each}
        </nav>
      </div>
    {/if}
    <!-- Footer -->
    <footer
      class="flex h-10 w-full items-center space-x-2 border-t border-zinc-600 bg-zinc-800/90 px-3"
    >
      {#if expanded}
        <p class="mr-auto font-light text-zinc-100">
          <kbd
            class="rounded-lg border-zinc-500 bg-zinc-600 px-2 py-1.5 text-xs font-semibold text-zinc-100"
            >Esc</kbd
          >
          to close
          <kbd
            class="rounded-lg border-zinc-500 bg-zinc-600 px-2 py-1.5 text-xs font-semibold text-zinc-100"
            >Tab</kbd
          >
          to navigate
          <kbd
            class="rounded-lg border-zinc-500 bg-zinc-600 px-2 py-1.5 text-xs font-semibold text-zinc-100"
            >Enter</kbd
          > to select
        </p>
      {/if}
      {#if !expanded}
        <span class="ml-auto text-sm font-medium text-zinc-100">Show More</span>
        <div class="h-6 w-6 rounded bg-zinc-600">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" class="text-zinc-100">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M17.25 13.75L12 19.25L6.75 13.75"></path>
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 18.25V4.75"></path>
          </svg>
        </div>
      {/if}
    </footer>
  </div>
{/if}

<Shortcuts shortcuts="{shortcuts}" />

<style lang="postcss">
  /* Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 14px;
    margin: 0;
  }

  *::-webkit-scrollbar-thumb {
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    border-radius: 9999px;
    background-color: #52525b;
  }
</style>
