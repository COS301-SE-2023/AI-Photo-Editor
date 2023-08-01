<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import GraphSelectionBoxItem from "./SelectionBoxItem.svelte";
  import { createEventDispatcher } from "svelte";
  import type { SelectionBoxItem } from "../../../types/selection-box";

  type SelectionBoxEvents = {
    editItem: {
      newItem: SelectionBoxItem;
    };
    removeItem: {
      id: string;
    };
    selectItem: {
      id: string;
    };
  };

  export let items: SelectionBoxItem[];
  export let selectedItemId: string;
  export let missingContentLabel: string = "No Items";
  export let itemsRemovable = false;

  let selectedItemTitle: string = "";

  let searchContainer: HTMLInputElement;
  let container: HTMLElement;
  let filteredItems: SelectionBoxItem[] = [];
  const searchPlaceholder = "Find...";
  let searchTerm = "";
  let showItems = false;

  const dispatch = createEventDispatcher<SelectionBoxEvents>();

  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof Node && !container?.contains(event.target)) {
        showItems = false;
      }
    };

    const handleResize = () => {
      showItems = false;
    };

    window.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  });

  function getSelectedItemTitle(itemId: string, items: SelectionBoxItem[]) {
    const item = items.find((i) => i.id === itemId);
    return item?.title ? item.title : "";
  }

  function filterItems(filter: string, items: SelectionBoxItem[]) {
    const filtered: SelectionBoxItem[] = items.filter((item) => {
      return item.title.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase());
    });
    return filtered;
  }

  function removeItem(event: CustomEvent<{ id: string }>) {
    const { id } = event.detail;
    const index = items.findIndex((item) => item.id === id);
    let selectedItemIndex = items.findIndex((item) => item.id === selectedItemId);

    if (index < 0) return;

    if (selectedItemId === id) {
      if (items.length > 1) {
        selectedItemIndex = selectedItemIndex === 0 ? 1 : selectedItemIndex - 1;
        selectedItemId = items[selectedItemIndex].id;
      } else {
        selectedItemId = "";
      }
    }

    items.splice(index, 1);
    items = items;

    dispatch("removeItem", event.detail);
  }

  function selectItem(event: CustomEvent<{ id: string }>) {
    const { id } = event.detail;
    selectedItemId = id;
    dispatch("selectItem", { id });
  }

  $: selectedItemTitle = getSelectedItemTitle(selectedItemId, items);
  $: filteredItems = filterItems(searchTerm, items);
  $: if (showItems) searchContainer?.focus();
  $: if (!selectedItemId && items.length > 0) selectedItemId = items[0].id;
</script>

<div class="relative w-36" bind:this="{container}">
  {#if showItems}
    <div
      class="absolute bottom-0 left-0 z-10 flex h-48 w-36 flex-col rounded-md border-[1px] border-zinc-600 bg-zinc-800/80 backdrop-blur-md"
      transition:slide="{{ duration: 300 }}"
    >
      <section class="flex items-center border-b-[1px] border-zinc-600 p-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="pointer-events-none h-6 w-6 stroke-zinc-400"
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
          bind:this="{searchContainer}"
          class="mr-auto h-7 w-full select-none border-none bg-transparent p-2 text-sm text-zinc-200 caret-rose-400 outline-none"
        />
      </section>

      {#if filteredItems.length > 0}
        <ul class="flex flex-col space-y-1 overflow-y-auto overflow-x-hidden p-1">
          {#each filteredItems as item (item.id)}
            <GraphSelectionBoxItem
              item="{item}"
              on:editItem
              on:removeItem="{removeItem}"
              on:selectItem="{selectItem}"
              selected="{item.id === selectedItemId}"
              removable="{itemsRemovable}"
            />
          {/each}
        </ul>
      {:else}
        <span class="flex h-full w-full items-center justify-center text-zinc-400"
          >{missingContentLabel}</span
        >
      {/if}
    </div>
  {/if}
  <div
    class="absolute bottom-0 left-0 flex h-7 w-36 items-center overflow-hidden rounded-md border border-zinc-600 bg-zinc-800/80 p-1 font-normal text-zinc-400 backdrop-blur-md"
    on:click="{() => (showItems = !showItems)}"
    on:keydown="{null}"
  >
    {#if items.length > 0}
      <span class="select-none truncate" title="{selectedItemTitle}">
        {selectedItemTitle}
      </span>
    {:else}
      <span class="select-none truncate italic text-gray-500">{missingContentLabel}</span>
    {/if}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.2"
      stroke="currentColor"
      class="pointer-events-none ml-auto h-4 w-4 stroke-rose-500"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        class="pointer-events-none"></path>
    </svg>
  </div>
</div>

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
