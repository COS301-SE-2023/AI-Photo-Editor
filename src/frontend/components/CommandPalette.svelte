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
    class="fixed inset-x-0 top-64 z-50 m-auto flex h-16 w-[40%] items-center rounded-xl border-[1px] border-zinc-600 bg-zinc-800"
  >
    <input
      type="text"
      placeholder="Manifest your vision"
      class="ml-6 mr-auto border-none bg-transparent text-gray-200 outline-none"
      bind:this="{inputElement}"
      bind:value="{inputValue}"
    />
    <div
      class="ml-auto mr-2 flex h-8 w-16 items-center justify-center rounded-full bg-zinc-500 hover:cursor-pointer hover:bg-zinc-600"
      on:click="{handleInput}"
      on:keydown="{handleInput}"
    >
      <p class="text-lg text-gray-200">Go</p>
    </div>
  </div>
{/if}

<svelte:window on:keydown="{handleKeyDown}" />
