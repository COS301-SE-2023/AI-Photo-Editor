<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>

<script lang="ts">
  import Graph from "./components/Graph.svelte";
  import PromptBox from "./components/PromptBox.svelte";
</script>

<main>
  <div class="flex flex-col h-screen">
      <div class="h-14 bg-zinc-700 border-b-2 border-gray-500 flex items-center">
      </div>
      <div class="flex grow">
          <div class="w-48 grow-0 bg-zinc-700 border-r-2 border-gray-500 flex flex-col items-center">
            <p class="text-xl text-purple-400 pt-2">Toolbox</p>
          </div>
          <div class="flex flex-col grow">
            <div class="grow">
              <Graph />
            </div>
            <PromptBox />
          </div>
      </div>
  </div>
</main>


