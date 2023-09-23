<script lang="ts">
  import type { Button } from "@shared/types";

  export let item: Button;
</script>

<div
  class="flex h-8 flex-nowrap items-center whitespace-nowrap rounded-md border-none bg-zinc-700/[0.70] px-2 text-sm font-medium text-zinc-300 shadow-md transition duration-300 ease-in-out hover:bg-zinc-600 hover:text-white"
  title="{item.value}"
  on:click="{() => item.onClick(item)}"
  on:keydown="{() => item.onClick(item)}"
>
  {item.value}
</div>
