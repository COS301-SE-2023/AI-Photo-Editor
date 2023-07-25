<script lang="ts">
  import { getContext } from "svelte";
  import type { MenuContext, Node } from "./ContextMenu.svelte";

  export let node: Node;

  const { onNodeClick } = getContext<MenuContext>("menu");
</script>

<li
  class="cursor-pointer rounded-md p-1 text-zinc-400 hover:bg-pink-200/5"
  on:click="{() => onNodeClick(node)}"
  on:keydown="{null}"
>
  {node.label}
</li>
