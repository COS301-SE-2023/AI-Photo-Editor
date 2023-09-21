<script lang="ts">
  import type { ButtonSetting } from "@shared/types";

  export let item: ButtonSetting;
</script>

<div
  class="flex h-8 flex-nowrap items-center rounded-md border-none bg-zinc-700/[0.70] px-2 text-sm font-medium text-zinc-300 shadow-md transition duration-300 ease-in-out hover:bg-zinc-600 hover:text-white"
  title="{item.value}"
  on:click="{() => item.onClick(item)}"
  on:keydown="{() => item.onClick(item)}"
>
  {item.value}
</div>
