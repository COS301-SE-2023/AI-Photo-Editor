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
  import { graphNodeMenuStore } from "../../lib/stores/ContextMenuStore";
  import { graphMall } from "../../lib/stores/GraphStore";
  import type { ItemGroup, Item, Action } from "../../lib/stores/ContextMenuStore";
  import ContextMenuItem from "./ContextMenuItem.svelte";
  import ContextMenuGroup from "./ContextMenuGroup.svelte";
  import { get, writable } from "svelte/store";
  import { setContext } from "svelte";

  const searchPlaceholder = "Search for nodes...";
  let searchTerm = "";

  let items: (ItemGroup | Item)[] = [
    {
      label: "Blix",
      items: [
        { label: "Brightness", action: { type: "addNode", signature: "brightness" } },
        { label: "Hue", action: { type: "addNode", signature: "hue" } },
        { label: "Rotate", action: { type: "addNode", signature: "rotate" } },
        { label: "Crop", action: { type: "addNode", signature: "crop" } },
      ],
    },
    {
      label: "Test",
      action: { type: "addNode", signature: "test" },
    },
    {
      label: "Pillow",
      items: [
        { label: "Rotate", action: { type: "addNode", signature: "rotate" } },
        { label: "Crop", action: { type: "addNode", signature: "crop" } },
        { label: "Brightness", action: { type: "addNode", signature: "brightness" } },
        { label: "Hue", action: { type: "addNode", signature: "hue" } },
      ],
    },
  ];

  let children = convertToNodes(items);
  let nodeIds = getNodeIds(children);
  let filteredNodes = filterNodes(children, searchTerm);
  let expandedNodeIds = writable<string[]>([]);

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

  setContext<MenuContext>("menu", {
    toggleExpand: (node: Node, expanded: boolean) => {
      if (expanded) {
        expandedNodeIds.update((ids) => [...ids, node.id]);
      } else {
        expandedNodeIds.update((ids) => ids.filter((id) => id != node.id));
      }
    },
    onNodeClick: (node: Node) => {
      const { action } = node;
      if (action) {
        console.log(action);
        const graphMenuState = get(graphNodeMenuStore);
        const graphStore = graphMall.getGraph(graphMenuState.graphId);
        if (action.type === "addNode") {
          graphStore.addNode(action.signature, {
            x: graphMenuState.canvasPos.x,
            y: graphMenuState.canvasPos.y,
          });
        }
      }
    },
    expandedNodeIds,
  });

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

  $: children = convertToNodes(items);
  $: nodeIds = getNodeIds(children);
  $: filteredNodes = filterNodes(children, searchTerm);
</script>

{#if $graphNodeMenuStore.isShowing}
  <div
    class="fixed inset-x-0 z-50 h-64 w-48"
    style:top="{$graphNodeMenuStore.windowPos.y}px"
    style:left="{$graphNodeMenuStore.windowPos.x}px"
  >
    <section
      class="fixed z-50 flex h-64 w-48 flex-col items-center overflow-hidden rounded-lg bg-zinc-800/80 ring-2 ring-zinc-600 backdrop-blur-md"
    >
      <section class="flex items-center border-b-2 border-zinc-500 p-1">
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
          class="text-md mr-auto h-7 w-full border-none bg-transparent p-2 text-zinc-200 caret-purple-300 outline-none"
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
          <span class="flex h-full w-full items-center justify-center text-zinc-400"
            >No results</span
          >
        {/if}
      </section>
    </section>
  </div>

  <!-- <div
    class="fixed inset-x-0 z-50 h-32 w-32 bg-red-500"
    style:top="{$graphNodeMenuStore.windowPos.y}px"
    style:left="{$graphNodeMenuStore.windowPos.x}px"
  >
    Jake: [{$graphNodeMenuStore.windowPos.x}][{$graphNodeMenuStore.windowPos
      .y}][{$graphNodeMenuStore.isShowing}]
  </div> -->
{/if}

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
