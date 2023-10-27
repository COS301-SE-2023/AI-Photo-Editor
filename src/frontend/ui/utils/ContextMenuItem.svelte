<script lang="ts">
  import { getContext } from "svelte";
  import type { MenuContext, Node } from "./ContextMenu.svelte";

  export let node: Node;

  const { onNodeClick } = getContext<MenuContext>("menu");
</script>

<li
  class="cursor-pointer truncate rounded-md p-1 text-zinc-400 hover:bg-primary-300/5 active:bg-primary-500/5"
  title="{node.label}"
  on:click="{() => onNodeClick(node)}"
  on:keydown="{null}"
>
  {node.label}
</li>
