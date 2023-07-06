<script lang="ts">
  import PaletteItem from "./PaletteItem.svelte";
  import { commandStore } from "../../../lib/stores/CommandStore";
  import type { ICommand } from "../../../../shared/types/index";
  import { onDestroy } from "svelte";
  import Shortcuts from "../../utils/Shortcuts.svelte";

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
  let categoriesOriginals: Category[] = [
    {
      title: "Recent",
      items: [],
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

  const unsubscribe = commandStore.subscribe((state) => {
    categoriesOriginals = [
      {
        title: "Recent",
        items: [],
      },
      {
        title: "Favourite",
        items: [],
      },
      {
        title: "All",
        items: state.commands,
      },
    ];

    categories = categoriesOriginals;
  });

  onDestroy(unsubscribe);

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

    // Determine direction of index overflow
    let direction: "f" | "b"; // forwards, backwards
    if (
      selectedItem >= categories[selectedCategory].items.length ||
      selectedCategory >= categories.length
    ) {
      direction = "f";
    } else if (selectedItem < 0 || selectedCategory < 0) {
      direction = "b";
    } else {
      return;
    }

    selectedItem = direction == "f" ? 0 : categories[selectedCategory].items.length - 1;

    // Select next non-empty category
    // Return to category 0 if none found
    let prevCategory = Math.max(0, selectedCategory); // Prevent negative index just in case
    selectedCategory = 0;

    for (let i = 0; i < categories.length; i++) {
      const cat = trueMod(prevCategory + (direction == "f" ? i + 1 : -i - 1), categories.length);

      if (categories[cat].items.length == 0) continue;

      selectedCategory = cat;
      selectedItem = direction == "f" ? 0 : categories[cat].items.length - 1;
      break;
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
      const item = categories[selectedCategory].items[selectedItem];
      handleAction(item);
    },
  };

  function handleAction(item: ICommand) {
    if (!showPalette) return;
    showPalette = false;

    console.log(item);
    commandStore.runCommand(item.signature);
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
    repairItemIndex();
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
                  <PaletteItem
                    title="{item.displayName}"
                    description="{item.signature.split('.')[0] === 'base-plugin'
                      ? 'Default'
                      : item.signature.split('.')[0]}"
                    selected="{i == selectedCategory && j == selectedItem}"
                    on:itemClicked="{() => handleAction(item)}"
                  />
                {/each}
              </ul>
            {/if}
          {/each}
        </nav>
      </div>
    {/if}
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
