<script lang="ts">
  let showPalette = false;
  let expanded = true;
  let inputElement: HTMLInputElement;
  let searchTerm = "";

  // type Item = {
  //   title: string;
  //   icon: string;
  // };

  type Category = {
    title: string;
    items: string[];
  };

  const categoriesOriginals: Category[] = [
    {
      title: "Nodes",
      items: ["Brightness", "Contrast", "Saturation", "Hue", "Sharpness", "Exposure", "Shadows"],
    },
    {
      title: "Commands",
      items: ["Import", "Export"],
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
    let categoriesDeepCopy = JSON.parse(JSON.stringify(categoriesOriginals));
    categories = categoriesDeepCopy.filter((category: Category) => {
      category.items = filterList(category.items);
      if (category.items.length) return category;
      return;
    });
    console.log(categories);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === "p") {
      showPalette = !showPalette;
    }
    if (event.key === "Escape" && showPalette) {
      showPalette = false;
    }
    if (event.key === "ArrowDown" && !expanded) {
      expanded = true;
    }
  }

  $: if (showPalette && inputElement) {
    inputElement.focus();
  }

  $: if (showPalette) {
    searchTerm = "";
    expanded = false;
  }
</script>

{#if showPalette}
  <div
    class="fixed inset-x-0 top-48 z-50 m-auto flex w-[40%] min-w-[400px] flex-col items-center overflow-hidden rounded-xl border border-zinc-600 bg-zinc-800/80 backdrop-blur"
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
    {#if expanded}
      <div
        class="hide-scrollbar container max-h-[400px] w-full overflow-x-auto border-t border-zinc-600 p-2"
      >
        <nav>
          {#each categories as category}
            <div class="p4 m-1 text-xs font-semibold text-zinc-400">{category.title}</div>
            <ul>
              {#each category.items as item}
                <li class="text-md my-2 rounded-md bg-pink-200/10 p-2 text-zinc-100">
                  <span>{item}</span>
                </li>
              {/each}
            </ul>
          {/each}
        </nav>
      </div>
    {/if}
    <!-- Footer -->
    <footer
      class="bg-zinc-800/85 flex h-10 w-full items-center space-x-2 border-t border-zinc-600 px-3 backdrop-blur"
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

<svelte:window on:keydown="{handleKeyDown}" />

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
