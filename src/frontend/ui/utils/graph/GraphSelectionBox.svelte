<script lang="ts">
  import { projectsStore } from "../../../lib/stores/ProjectStore";
  import { graphMall } from "../../../lib/stores/GraphStore";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { commandStore } from "../../../lib/stores/CommandStore";

  type Item = {
    name: string;
    id: string;
  };

  export let selectedGraphId = "";
  let selectedGraphName = "";
  let graphIdsStore = projectsStore.getReactiveActiveProjectGraphIds();
  let searchContainer: HTMLElement;
  let container: HTMLElement;
  let filteredItems: Item[] = [];
  let graphs: string[] = [];
  let items: Item[] = [];
  const searchPlaceholder = "Find...";
  let searchTerm = "";
  let showItems = false;

  const unsubscribe = graphIdsStore.subscribe((state) => {
    graphs = state;
  });

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
      unsubscribe();
    };
  });

  function getSelectedGraphName(graphId: string) {
    const graph = items.find((g) => g.id === graphId);
    return graph?.name ? graph.name : "-";
  }

  function filterItems(filter: string, items: Item[]) {
    const filtered: Item[] = items.filter((item) => {
      return item.name.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase());
    });
    return filtered;
  }

  function getItems(graphIds: string[]) {
    const items: Item[] = [];
    graphIds.forEach((id) => {
      console.log(id);
      items.push({
        id,
        name: graphMall.getGraphState(id)?.displayName || "",
      });
    });
    if (selectedGraphId === "" && items.length > 0) {
      selectedGraphId = items[0].id;
    }
    return items;
  }

  function selectGraph(graphId: string) {
    if (graphMall.getGraph(graphId)) {
      selectedGraphId = graphId;
    }
  }

  function deleteGraph(graphId: string) {
    commandStore.runCommand("blix.graphs.deleteGraph", { id: graphId });
    const index = graphs.findIndex((id) => id === graphId);

    if (index < 0) return;

    console.log("here");
    if (selectedGraphId === graphId) {
      if (graphs.length > 1) {
        selectedGraphId = index === 0 ? graphs[1] : graphs[index - 1];
      } else {
        console.log("here");
        selectedGraphId = "";
      }
    }

    graphs.splice(index, 1);
    graphs = graphs;
  }

  $: items = getItems(graphs);
  $: selectedGraphName = getSelectedGraphName(selectedGraphId);
  $: filteredItems = filterItems(searchTerm, items);
  $: if (showItems) searchContainer?.focus();
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
            <li
              class="flex w-full cursor-pointer items-center rounded-md p-1 text-zinc-400 active:bg-rose-400/5 {selectedGraphId ===
              item.id
                ? 'bg-rose-300/[0.08]'
                : ''} group hover:bg-rose-300/5"
              on:click="{() => selectGraph(item.id)}"
              on:keydown="{null}"
            >
              <span class="mr-1 truncate text-sm" title="{item.name}">{item.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.2"
                stroke="currentColor"
                class="invisible ml-auto h-4 w-4 hover:stroke-rose-500 group-hover:visible"
                on:click="{() => deleteGraph(item.id)}"
                on:keydown="{null}"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                ></path>
              </svg>
            </li>
          {/each}
        </ul>
      {:else}
        <span class="flex h-full w-full items-center justify-center text-zinc-400">No Graphs</span>
      {/if}
    </div>
  {/if}
  <div
    class="absolute bottom-0 left-0 flex h-7 w-36 items-center overflow-hidden rounded-md border-[1px] border-zinc-600 bg-zinc-800/80 p-1 font-normal text-zinc-400 backdrop-blur-md"
    on:click="{() => (showItems = !showItems)}"
    on:keydown="{null}"
  >
    {#if graphs.length > 0}
      <span class="select-none truncate" title="{selectedGraphName}">
        {selectedGraphName}
      </span>
    {:else}
      <span class="select-none truncate italic"></span>
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
