<script lang="ts">
  import { getContext } from "svelte";
  import type { MenuContext, Node } from "./ContextMenu.svelte";

  export let node: Node;

  const { onNodeClick } = getContext<MenuContext>("menu");
</script>

<li
  class="cursor-pointer truncate rounded-md p-1 text-zinc-400 hover:bg-rose-300/5 active:bg-rose-400/5"
  title="{node.label}"
  on:click="{() => onNodeClick(node)}"
  on:keydown="{null}"
>
  {node.label}
</li>
