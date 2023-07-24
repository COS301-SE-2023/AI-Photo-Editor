<script lang="ts">
  import { onMount } from "svelte";
  import { blixStore } from "../../lib/stores/BlixStore";
  import Navbar from "./Navbar.svelte";
  import Layout from "./layout/Layout.svelte";
  import Palette from "./palette/Palette.svelte";
  import Toasts from "../../ui/utils/toasts/Toasts.svelte";
  import { initAPIs } from "../../lib/api/apiInitializer";
  // import ContextMenu from "../../ui/utils/ContextMenu.svelte";
  import { GlobalContextMenuStore } from "lib/stores/ContextMenuStore";
  import Test from "./Test.svelte";

  const testing = false;

  onMount(async () => {
    await initAPIs();
  });
</script>

<Toasts />
<!-- <ContextMenu /> -->

<div
  class="fixed inset-x-0 h-32 w-32 bg-red-500 top-[{$GlobalContextMenuStore.windowPos.x.toString()}px] left-[600px] z-50"
>
  Jake
</div>

{#if testing}
  {#if $blixStore.blixReady}
    <Test />
  {:else}
    <div class="flex h-screen w-screen items-center justify-center bg-zinc-800 p-0">
      <span class="text-5xl text-purple-400">Loading</span>
    </div>
  {/if}
{:else if $blixStore.blixReady}
  <div class="h-screen w-screen bg-zinc-800 p-0">
    <div class="navbar {$blixStore.systemInfo.systemPlatform === 'darwin' ? 'pl-20' : ''}">
      <Navbar />
    </div>
    <div class="layout"><Layout /></div>
    <Palette />
  </div>
{:else}
  <div class="flex h-screen w-screen items-center justify-center bg-zinc-800 p-0">
    <span class="text-5xl text-purple-400">Loading</span>
  </div>
{/if}

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  body {
    padding: 0px;
  }

  :global(.splitpanes__pane) {
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.2) inset;
    justify-content: center;
    align-items: center;
    display: flex;
    position: relative;
  }
  :root {
    --navbar-height: 2rem;
  }

  div.navbar {
    width: 100%;
    height: var(--navbar-height);
    -webkit-app-region: drag;
  }

  div.layout {
    width: 100%;
    height: calc(100% - var(--navbar-height));
  }
</style>
