<script lang="ts">
  import { onMount } from "svelte";
  import { blixStore } from "../../lib/stores/BlixStore";
  import Navbar from "./Navbar.svelte";
  import Splash from "./Splash.svelte";
  import Layout from "./layout/Layout.svelte";
  import Palette from "./palette/Palette.svelte";
  import Toasts from "../../ui/utils/toasts/Toasts.svelte";
  import { initAPIs } from "../../lib/api/apiInitializer";
  import ContextMenu from "../../ui/utils/ContextMenu.svelte";
  import Test from "./Test.svelte";
  import Settings from "./Settings.svelte";
  import Shortcuts from "../../ui/utils/Shortcuts.svelte";
  import { settingsStore } from "../../lib/stores/SettingsStore";

  const testing = false;
  let showSettings = false;

  let showSplash = true;

  const shortcuts = {
    "blix.settings.toggle": () => {
      settingsStore.toggleSettings();
    },
    "blix.settings.hide": () => {
      settingsStore.hideSettings();
    },
    "blix.splash.hide": () => {
      showSplash = false;
    },
  };

  onMount(async () => {
    await initAPIs();
  });
</script>

{#if $blixStore.blixReady && testing}
  <Test />
{:else if !$blixStore.blixReady && testing}
  <div class="flex h-screen w-screen items-center justify-center bg-zinc-800 p-0">
    <span class="text-5xl text-purple-400">Loading</span>
  </div>
  <div></div>
{:else if $blixStore.blixReady}
  <div class="h-screen w-screen bg-zinc-800 p-0">
    {#if showSplash}
      <Splash
        on:click="{() => {
          showSplash = false;
        }}"
      />
    {/if}

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
  <div></div>
{/if}

{#if $settingsStore.showing}
  <Settings />
{/if}

<Toasts />
<ContextMenu />
<Shortcuts shortcuts="{shortcuts}" />

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
    overflow: hidden;
    background-color: #11111b;
  }
</style>
