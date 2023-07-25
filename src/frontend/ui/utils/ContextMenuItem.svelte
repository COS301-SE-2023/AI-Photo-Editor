<script lang="ts">
  import type { Item, CustomEvent } from "../../lib/stores/ContextMenuStore";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<CustomEvent>();

  export let item: Item;
</script>

<li
  class="cursor-pointer rounded-md p-1 text-zinc-400 hover:bg-pink-200/5"
  on:click="{() => dispatch('action', item)}"
  on:keydown="{null}"
>
  {item.label}
</li>
