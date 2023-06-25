<script lang="ts">
  import Item from "./Item.svelte";
  import type { GraphNode, GraphSlider } from "../types";
  import { paletteStore } from "../stores/PaletteStore";
  import { commandStore } from "../stores/CommandStore";
  import Shortcuts from "../Shortcuts.svelte";
  import type { ICommand } from "../../shared/types/index";

  let showPalette = false;
  let expanded = false;
  let inputElement: HTMLInputElement;
  let searchTerm = "";

  type Category = {
    title: string;
    items: ICommand[];
  };

  let selectedCategory = 0;
  let selectedItem = 0;

  // TODO: Change items to use the command store values directly:
  $commandStore; // Use the shorthand like this

  // TODO: Get rid of this
  const categoriesOriginals: Category[] = [
    {
      title: "Recent",
      items: $commandStore.commands,
    },
    {
      title: "Favourite",
      items: [],
    },
    {
      title: "All",
      items: $commandStore.commands,
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
    selectedCategory = 0;
    selectedItem = 0;

    let categoriesDeepCopy = JSON.parse(JSON.stringify(categoriesOriginals));
    categories = categoriesDeepCopy.filter((category: Category) => {
      category.items = filterList(category.items);
      if (category.items.length) return category;
      return;
    });
  }

  // If the item/category index is out of bounds, remap it back to a valid value
  function repairItemIndex(): void {
    // True modulo operator which wraps negatives back to [0, m]
    const trueMod = (n: number, m: number) => {
      return ((n % m) + m) % m;
    };

    let direction: "forward" | "backwards" | "none" = "none";

    if (selectedItem >= categories[selectedCategory].items.length) {
      selectedItem = 0;

      // Select next non-empty category
      // Return to category 0 if none found
      let prevCategory = Math.max(0, selectedCategory); // Prevent negative index just in case
      selectedCategory = 0;

      for (let i = 0; i < categories.length; i++) {
        const cat = trueMod(i + prevCategory + 1, categories.length);

        if (categories[cat].items.length == 0) continue;

        selectedCategory = cat;
        break;
      }
    } else if (selectedItem < 0) {
      selectedItem = categories[selectedCategory].items.length - 1;

      // Select previous non-empty category
      // Return to category 0 if none found
      let prevCategory = Math.max(0, selectedCategory); // Prevent negative index just in case
      selectedCategory = 0;

      for (let i = 0; i < categories.length; i++) {
        const cat = trueMod(prevCategory - i - 1 + categories.length, categories.length);

        if (categories[cat].items.length == 0) continue;

        selectedCategory = cat;
        selectedItem = categories[cat].items.length - 1;
        break;
      }
    }
  }

  const shortcuts = {
    "blix.palette.toggle": () => {
      showPalette = !showPalette;
    },
    "blix.palette.show": () => {
      showPalette = true;
    },
    "blix.palette.hide": () => {
      showPalette = false;
    },
    "blix.palette.scrollDown": () => {
      selectedItem++;
      repairItemIndex();
    },
    "blix.palette.scrollUp": () => {
      selectedItem--;
      repairItemIndex();
    },
    "blix.palette.selectItem": () => {
      // Default enter
      // handleAction();
    },
  };

  function handleAction() {
    // if (!showPalette) return;
    // showPalette = false;
    // const item = categories[categoryIndex].items[itemIndex];
    // const index = categoriesOriginals[0].items.indexOf(item);
    // // const itemId = item.toLocaleLowerCase().replaceAll(" ", "-");
    // const itemId = item.signature;
    // console.log(index);
    // console.log(item);
    // commandStore.runCommand(item.signature);
  }

  $: if (showPalette && inputElement) {
    inputElement.focus();
  }

  $: if (showPalette) {
    searchTerm = "";
    expanded = true;
    selectedCategory = 0;
    selectedItem = 0;
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
            {#if category.items.length > 0}
              <div class="p4 m-1 text-xs font-semibold text-zinc-400">
                {category.title}
              </div>
              <ul>
                {#each category.items as item, j}
                  <Item
                    title="{item.displayName}"
                    selected="{i == selectedCategory && j == selectedItem}"
                    on:itemClicked="{handleItemClick}"
                  />
                {/each}
              </ul>
            {/if}
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
