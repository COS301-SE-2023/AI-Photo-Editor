<script lang="ts">
  import type { Dropdown } from "@shared/types";

  export let item: Dropdown;
</script>

<select
  bind:value="{item.value}"
  class="h-8 rounded-md border-none bg-zinc-800/70 pl-3 text-zinc-400 ring-1 ring-zinc-600 focus:outline-none"
>
  {#each item.options as option}
    {#if item.value === option}
      <option value="{option}" selected>{option}</option>
    {:else}
      <option value="{option}">{option}</option>
    {/if}
  {/each}
</select>

<style lang="postcss">
  SELECT {
    background: url("data:image/svg+xml,<svg height='16px' width='16px' viewBox='0 0 24 24' stroke='rgb(244, 63, 94)' fill='none' stroke-width='1.2' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /></svg>")
      no-repeat;
    background-position: calc(100% - 0.3rem) center !important;
    -moz-appearance: none !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    padding-right: 2rem !important;
  }
</style>
