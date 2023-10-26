<!-- TODO: Expand to maybe incorporate sections  -->
<script lang="ts">
  import type { Setting } from "@shared/types/setting";
  import SecureInput from "./SecureInput.svelte";
  import Dropdown from "./Dropdown.svelte";
  import Button from "./Button.svelte";
  import ColorPicker from "./ColorPicker/ColorPicker.svelte";

  export let item: Setting;
</script>

<div class="flex items-center border-t border-zinc-700 pb-3 pt-3">
  <div>
    <div class="text-normal font-semibold text-zinc-300">{item.title}</div>
    {#if item.subtitle}
      <div class="font-ligt text-sm text-zinc-500">{@html item.subtitle}</div>
    {/if}
    <slot />
  </div>

  <div class="ml-auto flex items-center space-x-2">
    {#each item.components as component (component.id)}
      {#if component.type === "text" && component.secret}
        <SecureInput
          bind:value="{component.value}"
          id="{item.id}"
          placeholder="{component.placeholder}"
        />
      {:else if component.type === "dropdown"}
        <Dropdown bind:item="{component}" />
      {:else if component.type === "button"}
        <Button item="{component}" />
      {:else if component.type === "colorPicker"}
        <ColorPicker bind:item="{component}" />
      {/if}
    {/each}
  </div>
</div>
