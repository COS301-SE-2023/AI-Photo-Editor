<script lang="ts">
  import tinykeys from "tinykeys";
  import Item from "./Item.svelte";
  import type { GraphNode, GraphSlider } from "../types";
  import { graphStore } from "../stores/GraphStore";
  import { paletteStore } from "../stores/PaletteStore";
  import { commandStore, type Command } from "../stores/CommandStore";

  let showPalette = false;
  let expanded = true;
  let inputElement: HTMLInputElement;
  let searchTerm = "";

  type Category = {
    title: string;
    items: Command[];
  };

  let categoryIndex = 0;
  let itemIndex = 0;

  // TODO: Change items to use the command store values directly:
  $commandStore; // Use the shorthand like this

  // TODO: Get rid of this
  const categoriesOriginals: Category[] = [
    //{
    //  title: "Nodes",
    //  // items: ["Brightness", "Contrast", "Saturation", "Hue", "Sharpness", "Exposure", "Shadows"],
    //  items: ["Brightness", "Saturation", "Hue", "Rotate", "Shadows", "Output"],
    //},
    {
      title: "Commands",
      // items: ["Import", "Export", "Clear"],
      items: $commandStore.commands,
    },
  ];

  let categories = categoriesOriginals;

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

  function handleMoveDown() {
    if (itemIndex === categories[categoryIndex].items.length - 1) {
      if (categoryIndex !== categories.length - 1) {
        categoryIndex++;
        itemIndex = 0;
      }
    } else {
      itemIndex++;
    }
  }

  function handleMoveUp() {
    if (itemIndex === 0) {
      if (categoryIndex !== 0) {
        categoryIndex--;
        itemIndex = categories[categoryIndex].items.length - 1;
      }
    } else {
      itemIndex--;
    }
  }

  function handleAction() {
    if (!showPalette) return;

    showPalette = false;
    const item = categories[categoryIndex].items[itemIndex];

    const index = categoriesOriginals[0].items.indexOf(item);
    // const itemId = item.toLocaleLowerCase().replaceAll(" ", "-");
    const itemId = item.signature;

    console.log(index);
    console.log(item);
    commandStore.runCommand(item.signature);

    if (false) {
      if (itemId === "clear") {
        graphStore.set({ nodes: [] });
        paletteStore.update((store) => ({ ...store, src: "" }));
        // window.api.send("clear-file");
        return;
      }

      const graphNode: GraphNode = {
        id: itemId,
        name: item.displayName,
        slider: generateSlider(itemId),
        connection: "",
      };

      let found = false;
      $graphStore.nodes.forEach((n) => {
        if (n.id === graphNode.id) found = true;
      });

      if (!found) {
        graphStore.update((store) => ({ nodes: [...store.nodes, graphNode] }));
      }
    }
  }

  function handleItemClick(event: CustomEvent<{ id: string }>) {
    for (let i = 0; i < categories.length; i++) {
      for (let j = 0; j < categories[i].items.length; j++) {
        if (categories[i].items[j].displayName === event.detail.id) {
          categoryIndex = i;
          itemIndex = j;
          handleAction();
        }
      }
    }
  }

  function generateSlider(id: string) {
    const slider: GraphSlider = {
      min: 0,
      max: 2,
      step: 0.1,
      fixed: 1,
      value: 1,
    };

    if (id === "rotate") {
      slider.max = 360;
      slider.step = 5;
      slider.value = 0;
      slider.fixed = 0;
    } else if (id === "hue") {
      slider.max = 360;
      slider.step = 10;
      slider.value = 0;
      slider.fixed = 0;
    }

    return slider;
  }

  tinykeys(window, {
    "$mod+p": (event) => {
      event.preventDefault();
      showPalette = !showPalette;
    },
    Escape: () => {
      if (showPalette) showPalette = false;
    },
    ArrowDown: () => {
      if (!expanded) expanded = true;
    },
    ArrowUp: () => {
      if (!expanded) expanded = true;
    },
    "Shift+Tab": handleMoveUp,
    Tab: handleMoveDown,
    "Control+J": handleMoveDown,
    "Control+K": handleMoveUp,
    Enter: handleAction,
  });

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
                  title="{item.displayName}"
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
