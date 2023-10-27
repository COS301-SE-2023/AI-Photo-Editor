<script lang="ts">
  import PaletteItem from "./PaletteItem.svelte";
  import { projectsStore } from "../../../lib/stores/ProjectStore";
  import { commandStore } from "../../../lib/stores/CommandStore";
  import type { ICommand, QueryResponse } from "../../../../shared/types/index";
  import { onDestroy, onMount } from "svelte";
  import Shortcuts from "../../utils/Shortcuts.svelte";
  import { toastStore } from "../../../lib/stores/ToastStore";
  import { get } from "svelte/store";
  let showPalette = false;
  let expanded = true;
  let inputElement: HTMLInputElement;
  let searchTerm = "";

  type Category = {
    title: string;
    items: ICommand[];
  };

  let selectedCategory = 0;
  let selectedItem = 0;

  let promptHistory: string[] = [];
  let navigationInProcess = false;
  let historyNavigationIndex = 0;

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
  let commandFilterList = ["blix.projects.recent", "blix.graphs.deleteGraph"];

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
        items: state.commands.filter((command) => {
          return !commandFilterList.includes(command.id);
        }),
      },
    ];

    categories = categoriesOriginals;
  });

  onMount(async () => {
    promptHistory = await window.apis.utilApi.getState<string[]>("prompts");
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
    if (categories.length == 0) {
      selectedCategory = 0;
      selectedItem = 0;
      return;
    }

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

  function openPalette() {
    showPalette = true;
    searchTerm = "";
    selectedCategory = 0;
    selectedItem = 0;
    categories = categoriesOriginals;
  }

  function closePalette() {
    showPalette = false;
    searchTerm = "";
  }

  const shortcuts = {
    "blix.palette.toggle": () => {
      if (showPalette) {
        closePalette();
      } else {
        openPalette();
      }
    },
    "blix.palette.show": () => {
      openPalette();
    },
    "blix.palette.hide": () => {
      closePalette();
    },
    "blix.palette.scrollDown": () => {
      if (!showPalette) return;

      navigationInProcess = true;
      selectedItem++;
      repairItemIndex();
    },
    "blix.palette.scrollUp": () => {
      if (!showPalette) return;

      if (promptHistory.length && !navigationInProcess) {
        // inputElement.focus();
        // inputElement.value = prompts[0];
        // inputElement.selectionStart = inputElement.selectionEnd = prompts[0].length;
        searchTerm = promptHistory[historyNavigationIndex++] || "";
        // inputElement.setSelectionRange(searchTerm.length, 0);
        return;
      }
      selectedItem--;
      repairItemIndex();
    },
    "blix.palette.selectItem": () => {
      if (!showPalette) return;

      // Default enter
      const item = categories[selectedCategory]?.items[selectedItem];
      if (item) {
        handleAction(item);
      }
    },
    "blix.palette.prompt": async () => {
      if (!showPalette) return;

      const prompt = searchTerm.trim();

      if (!prompt) {
        return;
      }

      closePalette();

      const messages = [
        "👨🏼‍🍳 Cooking...",
        "🪄 Stirring the creative cauldron...",
        // "🚀 Embarking on an adventure...",
        // "🍿 Popping ideas into action...",
        // "🎨 Painting a masterpiece...",
        // "⚡️ Igniting sparks of brilliance...",
        // "🔧 Building dreams from scratch...",
        // "🐾 Unleashing wild ideas...",
      ];
      const dismiss = toastStore.trigger({
        message: messages[Math.floor(Math.random() * messages.length)],
        type: "loading",
      });

      const index = promptHistory.indexOf(prompt);
      if (index !== -1) {
        promptHistory.splice(index, 1);
      }
      promptHistory.unshift(prompt);
      await window.apis.utilApi.saveState("prompts", promptHistory);

      try {
        const graphUUID = $projectsStore.activeProject
          ? get($projectsStore.activeProject.focusedGraph)
          : "";
        const res = graphUUID
          ? await window.apis.utilApi.sendPrompt(prompt, graphUUID)
          : { status: "error", message: "No selected graph." };

        toastStore.trigger({
          message: res.message,
          type: res.status === "error" ? "error" : "success",
          timeout: 5000,
        });
      } catch (error) {
        toastStore.trigger({ message: "Oops😐 That wasn't supposed to happen", type: "error" });
      } finally {
        dismiss();
      }
    },
  };

  function handleAction(item: ICommand) {
    if (!showPalette) return;
    showPalette = false;

    console.log(item);
    commandStore.runCommand(item.id);
  }

  $: inputElement?.focus();

  $: {
    selectedCategory;
    selectedItem;
    repairItemIndex();
  }

  $: if (searchTerm === "") {
    historyNavigationIndex = 0;
    navigationInProcess = false;
  }

  $: {
    searchTerm;
    onSearch();
  }
</script>

{#if showPalette}
  <div
    class="fixed inset-x-0 top-48 z-[6969669669] m-auto flex w-[40%] min-w-[300px] max-w-[600px] flex-col items-center overflow-hidden rounded-xl border border-zinc-600 bg-zinc-800/80 backdrop-blur-md"
  >
    <!-- Header -->
    <header class="flex w-full select-none items-center px-3 caret-primary-500">
      <input
        type="text"
        placeholder="Search for commands or ask AI..."
        class="mr-auto h-14 w-full border-none bg-transparent text-lg text-zinc-100 outline-none"
        bind:this="{inputElement}"
        bind:value="{searchTerm}"
        spellcheck="false"
      />
      {#if searchTerm !== ""}
        <div class="float-right flex min-w-max items-center space-x-2 pl-2">
          <span class="text-sm font-medium text-zinc-500">Ask AI</span>
          <span class="rounded-md p-1 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-500"
            >Tab</span
          >
        </div>
      {/if}
    </header>

    <!-- Results -->
    <div
      class="hide-scrollbar container h-[400px] w-full overflow-x-auto border-t border-zinc-600 p-2"
    >
      {#if categories.length > 0}
        <nav>
          {#each categories as category, i}
            {#if category.items.length > 0}
              <div class="p4 m-1 text-xs font-semibold text-zinc-400">
                {category.title}
              </div>
              <ul>
                {#each category.items as item, j}
                  <PaletteItem
                    title="{item.name}"
                    description="{item.id.split('.')[0]}"
                    selected="{i == selectedCategory && j == selectedItem}"
                    on:itemClicked="{() => handleAction(item)}"
                  />
                {/each}
              </ul>
            {/if}
          {/each}
        </nav>
      {:else}
        <div class="flex h-full w-full select-none flex-col items-center justify-center space-y-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="h-16 w-16 text-zinc-200"
          >
            <path
              fill-rule="evenodd"
              d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
              clip-rule="evenodd"></path>
          </svg>
          <h1 class="text-xl font-bold text-zinc-400">Ask AI to assist with a task</h1>
          <div class="flex flex-col items-center justify-center text-zinc-500">
            <span>"I want to edit the brightness, hue and noise of an image."</span>
            <span>"What is the result of 16 subtract 42, squared?"</span>
            <!-- <span>"I want my image to sparkly like summer's day"</span> -->
            <span>"Make my image more medieval"</span>
          </div>
        </div>
      {/if}
    </div>
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
