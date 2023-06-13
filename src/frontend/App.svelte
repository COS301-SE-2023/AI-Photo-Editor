<script lang="ts">
  // import Layout from "./layout/Layout.svelte";
  // import Navbar from "./layout/Navbar.svelte";
  // import Palette from "./components/Palette.svelte";

  import { bindMainApis } from "./client";

  let count = 0;

  async function init() {
    // Bind to backend IPC APIs
    window.apis = await bindMainApis();

    window.apis.utilApi.count();
    await getNum();
  }

  async function getNum() {
    count = await window.apis.utilApi.count();
  }
</script>

{#await init() then}
  <div on:click="{getNum}" on:keypress="{getNum}" class="h-16 w-16 bg-sky-300">{count}</div>
  <!-- <div class="navbar"><Navbar /></div>
  <div class="layout"><Layout /></div>
  <Palette /> -->
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
