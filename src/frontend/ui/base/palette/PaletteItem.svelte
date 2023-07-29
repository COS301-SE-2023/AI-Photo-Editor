<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let selected = false;
  export let title = "";
  export let description = "";
  let itemRef: HTMLElement;

  const dispatch = createEventDispatcher<{ itemClicked: { id: string } }>();

  function clicked() {
    dispatch("itemClicked", { id: title });
  }

  $: if (selected && itemRef) {
    itemRef.scrollIntoView(false);
  }
</script>

<li
  class="text-md my-2 flex items-center rounded-md p-2 text-zinc-100 {selected
    ? 'bg-rose-300/10'
    : 'hover:bg-rose-300/5'} hover:cursor-pointer"
  bind:this="{itemRef}"
  on:click="{clicked}"
  on:keydown="{clicked}"
>
  <span class="truncate" title="{title}">{title}</span>
  {#if selected}
    <span class="ml-auto text-xs text-zinc-400">{description}</span>
  {/if}
</li>
