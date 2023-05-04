<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  body {
    padding: 0px;
  }

  :global(.splitpanes__pane) {
  box-shadow: 0 0 3px rgba(0, 0, 0, .2) inset;
  justify-content: center;
  align-items: center;
  display: flex;
  position: relative;
}

</style>

<script lang="ts">
  import Layout from "./layout/Layout.svelte";
  import Navbar from "./layout/Navbar.svelte";
</script>

<Navbar />
<Layout />

<main>
</main>