<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let selected = false;
  export let title = "";
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
  class="text-md my-2 rounded-md p-2 text-zinc-100 {selected
    ? 'bg-pink-200/10'
    : 'hover:bg-pink-200/5'} hover:cursor-pointer"
  bind:this="{itemRef}"
  on:click="{clicked}"
  on:keydown="{clicked}"
>
  <span>{title}</span>
</li>
