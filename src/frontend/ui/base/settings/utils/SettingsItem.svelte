<!-- TODO: Expand to maybe incorporate sections  -->
<script lang="ts">
  import type { Setting } from "@shared/types/setting";
  import SecureInput from "./SecureInput.svelte";
  import Dropdown from "./Dropdown.svelte";
  import Button from "./Button.svelte";

  export let item: Setting;
</script>

<div class="flex items-center border-t border-zinc-700 pb-3 pt-3">
  <div>
    <div class="text-normal font-semibold text-zinc-300">{item.title}</div>
    {#if item.subtitle}
      <div class="font-ligt text-sm text-zinc-500">{item.subtitle}</div>
    {/if}
    <slot />
  </div>

  <div class="ml-auto flex items-center space-x-2">
    {#if item.type === "text" && item.secret}
      <SecureInput bind:value="{item.value}" id="{item.id}" placeholder="{item.placeholder}" />
    {:else if item.type === "dropdown"}
      <Dropdown bind:item="{item}" />
    {:else if item.type === "button"}
      <Button item="{item}" />
    {/if}
  </div>
</div>
