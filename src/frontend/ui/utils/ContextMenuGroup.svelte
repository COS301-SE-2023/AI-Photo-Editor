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
      class="flex cursor-pointer items-center rounded-md p-1 hover:bg-pink-200/5 focus:bg-pink-200"
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
          class="h-4 w-4 stroke-purple-500"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          ></path>
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-4 w-4 stroke-purple-500"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"></path>
        </svg>
      {/if}
      <div class="text-zinc-400">{root.label}</div>
    </div>
    {#if expanded && root.children}
      <ul
        class="ml-[17px] border-l-[0.8px] border-zinc-400 px-2 text-zinc-500"
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
