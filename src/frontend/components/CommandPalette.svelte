<script lang="ts">
  let showPalette = false;
  let inputElement: HTMLInputElement;
  let inputValue = "";

  function handleKeyDown(event: KeyboardEvent) {
    if (event.metaKey && event.key === "p") {
      showPalette = !showPalette;
    }
    if (event.key === "Escape" && showPalette) {
      showPalette = false;
    }
    if (event.key === "Enter" && showPalette) {
      handleInput();
    }
  }

  function handleInput() {
    console.log(inputValue.trim());
  }

  $: if (showPalette && inputElement) {
    inputElement.focus();
  }

  $: if (showPalette) {
    inputValue = "";
  }
</script>

{#if showPalette}
  <div
    class="fixed inset-x-0 top-64 z-50 m-auto flex h-16 w-[40%] items-center rounded-xl border-2 border-ctp-mauve bg-ctp-base"
  >
    <input
      type="text"
      placeholder="Search for tools and filters..."
      class="mr-auto w-full border-none bg-transparent px-6 text-lg text-ctp-text outline-none"
      bind:this="{inputElement}"
      bind:value="{inputValue}"
    />
  </div>
{/if}

<svelte:window on:keydown="{handleKeyDown}" />
