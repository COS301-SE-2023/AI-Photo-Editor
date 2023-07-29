<script lang="ts">
  //   import type { ItemGroup } from "../../lib/stores/ContextMenuStore";
  import ContextMenuItem from "./ContextMenuItem.svelte";
  import { slide } from "svelte/transition";
  import type { Node, MenuContext } from "./ContextMenu.svelte";
  import { getContext } from "svelte";

  export let root: Node;
  export let indent = 0;
  let expanded = false;

  const { toggleExpand, expandedNodeIds } = getContext<MenuContext>("menu");

  $: expanded = $expandedNodeIds.includes(root.id);
</script>

<ul>
  <li>
    <div
      class="flex cursor-pointer items-center rounded-md p-1 hover:bg-rose-300/5 active:bg-rose-400/5"
      on:click="{() => {
        expanded = !expanded;
        toggleExpand(root, expanded);
      }}"
      on:keydown="{null}"
    >
      {#if expanded}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="pointer-events-none h-4 w-4 stroke-rose-500"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            class="pointer-events-none"></path>
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="pointer-events-none h-4 w-4 stroke-rose-500"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
            class="pointer-events-none"></path>
        </svg>
      {/if}
      <div class="truncate text-zinc-400" title="{root.label}">{root.label}</div>
    </div>
    {#if expanded && root.children}
      <ul
        class="ml-[17px] border-l-[0.8px] border-zinc-600 px-2 text-zinc-400"
        transition:slide="{{ duration: 150 }}"
      >
        {#each root.children as node (node.id)}
          {#if node.children}
            <svelte:self root="{node}" indent="{indent + 10}" />
          {:else}
            <ContextMenuItem node="{node}" />
          {/if}
        {/each}
      </ul>
    {/if}
  </li>
</ul>
