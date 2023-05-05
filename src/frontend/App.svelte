<script lang="ts">
  import Graph from "./components/Graph.svelte";
  import PromptBox from "./components/PromptBox.svelte";
</script>

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

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
