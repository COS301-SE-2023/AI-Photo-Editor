<script lang="ts">
  import Layout from "./layout/Layout.svelte";
  import Navbar from "./layout/Navbar.svelte";
  import Palette from "./palette/Palette.svelte";
</script>

<div class="navbar"><Navbar /></div>
<div class="layout"><Layout /></div>
<Palette />

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
    --navbar-height: 1.5em;
  }

  div.navbar {
    width: 100%;
    height: var(--navbar-height);
  }

  div.layout {
    width: 100%;
    height: calc(100% - var(--navbar-height));
  }
</style>
