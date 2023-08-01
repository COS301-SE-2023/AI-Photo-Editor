<script context="module" lang="ts">
  import type { Writable } from "svelte/store";

  export type Node = {
    id: string;
    label: string;
    icon?: string;
    action?: Action;
    children?: Node[];
  };

  export type MenuContext = {
    toggleExpand: (node: Node, expanded: boolean) => void;
    onNodeClick: (node: Node) => void;
    expandedNodeIds: Writable<string[]>;
  };
</script>

<script lang="ts">
  import { graphMenuStore } from "../../lib/stores/GraphContextMenuStore";
  import { focusedGraphStore, graphMall } from "../../lib/stores/GraphStore";
  import type { ItemGroup, Item, Action } from "../../lib/stores/GraphContextMenuStore";
  import ContextMenuItem from "./ContextMenuItem.svelte";
  import ContextMenuGroup from "./ContextMenuGroup.svelte";
  import { get, writable } from "svelte/store";
  import { onMount, setContext } from "svelte";
  import Shortcuts from "./Shortcuts.svelte";

  const searchPlaceholder = "Search for nodes...";
  let searchTerm = "";
  let children: Node[] = [];
  let filteredNodes: Node[] = [];
  let expandedNodeIds = writable<string[]>([]);
  let searchBox: HTMLInputElement;
  let menuContainer: HTMLElement;
  let isShowing = false;

  $: ({ items } = $graphMenuStore);
  $: children = convertToNodes(items);
  $: filteredNodes = filterNodes(children, searchTerm);
  $: {
    isShowing = $graphMenuStore.isShowing;
    if (isShowing) {
      searchBox?.focus();
    } else {
      searchTerm = "";
    }
  }

  setContext<MenuContext>("menu", {
    // List with expanded nodes get updated when group is toggled
    toggleExpand: (node: Node, expanded: boolean) => {
      if (expanded) {
        expandedNodeIds.update((ids) => [...ids, node.id]);
      } else {
        expandedNodeIds.update((ids) => ids.filter((id) => id != node.id));
      }
    },
    onNodeClick: (node: Node) => {
      graphMenuStore.hideMenu();

      const { action } = node;

      if (!action) return;

      const graphMenuState = get(graphMenuStore);
      const graphStore = graphMall.getGraph($focusedGraphStore.graphUUID);

      if (!graphStore) return;

      if (action.type === "addNode") {
        graphStore.addNode(action.signature, {
          x: graphMenuState.canvasPos.x,
          y: graphMenuState.canvasPos.y,
        });
      }
    },
    expandedNodeIds,
  });

  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof Node && !menuContainer?.contains(event.target)) {
        graphMenuStore.hideMenu();
      }
    };

    const handleResize = () => {
      graphMenuStore.setScreenDimensions(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  });

  // TODO: Remove item interfaces at stage and just keep the Node interface
  function convertToNodes(items: (ItemGroup | Item)[]): Node[] {
    let nodes: Node[] = [];

    for (const item of items) {
      if ("items" in item) {
        let children = convertToNodes(item.items);
        nodes.push({
          id: generateId(),
          label: item.label,
          children,
        });
      } else {
        let node: Node = {
          id: generateId(),
          label: item.label,
          action: item.action,
        };

        if (item.icon) {
          node.icon = item.icon;
        }

        nodes.push(node);
      }
    }

    return nodes;
  }

  function getNodeIds(nodes: Node[], includeLeaves = true): string[] {
    const ids: string[] = [];

    for (const node of nodes) {
      if (includeLeaves) {
        ids.push(node.id);
      }
      if (node.children) {
        ids.push(node.id);
        ids.push(...getNodeIds(node.children, includeLeaves));
      }
    }

    return ids;
  }

  function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  function expandAll() {
    expandedNodeIds.set(getNodeIds(children, false));
  }

  function collapseAll() {
    expandedNodeIds.set([]);
  }

  function filterNodes(nodes: Node[], filter: string) {
    let filteredNodes: Node[] = [];

    for (const node of nodes) {
      if (node.children) {
        const filteredChildren = filterNodes(node.children, filter);

        if (filteredChildren.length > 0) {
          filteredNodes.push({
            id: node.id,
            label: node.label,
            children: filteredChildren,
          });
        }
      } else {
        if (node.label.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase())) {
          filteredNodes.push(node);
        }
      }
    }

    return filteredNodes;
  }

  function handleInput() {
    if (searchTerm) {
      expandAll();
    } else {
      collapseAll();
    }
  }

  const shortcuts = {
    "blix.contextMenu.show": () => {
      // TODO: This might have to be moved to Graph.svelte instead
      // graphMenuStore.showMenu(...);
    },
    "blix.contextMenu.hide": () => {
      graphMenuStore.hideMenu();
    },
    "blix.contextMenu.scrollDown": () => {
      // TODO
    },
    "blix.contextMenu.scrollUp": () => {
      // TODO
    },
    "blix.contextMenu.selectItem": () => {
      // TODO
    },
  };
</script>

{#if $graphMenuStore.isShowing}
  <div
    class="graph-context-menu fixed z-[2147483647] flex h-[240px] w-[192px] flex-col items-center overflow-hidden rounded-lg border-[1px] border-zinc-600 bg-zinc-800/80 backdrop-blur-md"
    style:top="{$graphMenuStore.cursorPos.y}px"
    style:left="{$graphMenuStore.cursorPos.x}px"
    bind:this="{menuContainer}"
  >
    <section class="flex items-center border-b-[1px] border-zinc-600 p-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6 stroke-zinc-400"
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
        on:input="{handleInput}"
        bind:this="{searchBox}"
        class="mr-auto h-7 w-full select-none border-none bg-transparent p-2 text-sm text-zinc-200 caret-rose-400 outline-none"
      />
    </section>
    <section class="flex h-full w-full select-none flex-col overflow-y-auto p-1">
      {#if filteredNodes.length > 0}
        <ul>
          {#each filteredNodes as node (node.id)}
            {#if node.children}
              <ContextMenuGroup root="{node}" />
            {:else}
              <ContextMenuItem node="{node}" />
            {/if}
          {/each}
        </ul>
      {:else}
        <span class="flex h-full w-full items-center justify-center text-zinc-400">No results</span>
      {/if}
    </section>
  </div>
{/if}

<Shortcuts shortcuts="{shortcuts}" />

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
