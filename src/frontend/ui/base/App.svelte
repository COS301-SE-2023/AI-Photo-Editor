<script lang="ts">
  import { init } from "../../lib/Blix";
  import { blixStore } from "../../lib/stores/BlixStore";
  import Navbar from "./Navbar.svelte";

  import Layout from "./layout/Layout.svelte";
  import Palette from "./palette/Palette.svelte";
</script>

{#await init() then}
  <div class="navbar {$blixStore.systemInfo.systemPlatform === 'darwin' ? 'pl-20' : ''}">
    <Navbar />
  </div>
  <div class="layout"><Layout /></div>
  <Palette />
{/await}

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
