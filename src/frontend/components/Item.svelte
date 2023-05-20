<script lang="ts">
  export let selected = false;
  export let title = "";
  let itemRef: HTMLElement;

  $: if (selected && itemRef) {
    // itemRef.scrollIntoView({
    // 	behavior: "smooth",
    // 	block: "end"
    // })
    itemRef.scrollIntoView(false);
  }
</script>

<li
  class="text-md my-2 rounded-md p-2 text-zinc-100 {selected ? 'bg-pink-200/10' : ''} {!selected
    ? 'hover:bg-pink-200/5'
    : ''}"
  bind:this="{itemRef}"
>
  <span>{title}</span>
</li>
