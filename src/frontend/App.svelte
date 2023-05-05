<script lang="ts">
  import Layout from "./layout/Layout.svelte";
  import Navbar from "./layout/Navbar.svelte";

  import Graph from "./components/Graph.svelte";
  import PromptBox from "./components/PromptBox.svelte";
</script>

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

<div class="navbar"><Navbar /></div>
<div class="layout"><Layout /></div>

<main>
  <div class="flex h-screen flex-col">
    <div class="flex h-14 items-center border-b-2 border-gray-500 bg-zinc-700"></div>
    <div class="flex grow">
      <div class="flex w-48 grow-0 flex-col items-center border-r-2 border-gray-500 bg-zinc-700">
        <p class="pt-2 text-xl text-purple-400">Toolbox</p>
      </div>
      <div class="flex grow flex-col">
        <div class="grow">
          <Graph />
        </div>
        <PromptBox />
      </div>
    </div>
  </div>
</main>