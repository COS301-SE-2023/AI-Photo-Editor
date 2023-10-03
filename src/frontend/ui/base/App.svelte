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
  import Settings from "./settings/Settings.svelte";
  import Shortcuts from "../../ui/utils/Shortcuts.svelte";
  import { settingsStore } from "../../lib/stores/SettingsStore";
  import { confetti } from "@neoconfetti/svelte";
  import { projectsStore } from "../../lib/stores/ProjectStore";

  const testing = false;

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

  // projectsStore.subscribe((state) => {
  //   console.log(state);
  // });
</script>

<!-- <div class="fixed top-0 right-0" use:confetti={{ particleCount: 200, force: 0.6, stageHeight: window.innerHeight - 20 }} /> -->

{#if $blixStore.blixReady && testing}
  <Test />
{:else if !$blixStore.blixReady && testing}
  <div class="flex h-screen w-screen items-center justify-center bg-zinc-800 p-0">
    <!-- <span class="text-5xl text-purple-400">Loading</span> -->
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

    <div class="navbar {$blixStore.system.platform === 'darwin' ? 'pl-20' : ''}">
      <Navbar />
    </div>
    <div class="layout">
      <Layout />
    </div>
    <Palette />
  </div>
{:else}
  <div class="flex h-screen w-screen items-center justify-center bg-zinc-800 p-0">
    <!-- <span class="text-5xl text-purple-400">Loading</span> -->
  </div>
  <div></div>
{/if}

<div class="{$settingsStore.showing ? '' : 'hidden'}">
  <Settings />
</div>

<Toasts />
<ContextMenu />
<Shortcuts shortcuts="{shortcuts}" />

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  :root {
    --navbar-height: 2rem;

    --color-primary-50: 255, 241, 242;
    --color-primary-100: 255, 228, 230;
    --color-primary-200: 254, 205, 211;
    --color-primary-300: 253, 164, 174;
    --color-primary-400: 251, 113, 132;
    --color-primary-500: 244, 62, 92;
    --color-primary-600: 225, 29, 71;
    --color-primary-700: 190, 18, 59;
    --color-primary-800: 159, 18, 56;
    --color-primary-900: 136, 19, 54;
    --color-primary-950: 76, 5, 25;
  }

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
