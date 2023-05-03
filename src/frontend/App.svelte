<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>

<script lang="ts">
  import { Svelvet, ThemeToggle, Node, Background } from "svelvet";
</script>

<main>
  <div class="h-screen flex flex-col">
    <div class="h-14 bg-zinc-700 relative top-0 border-b-2 border-gray-500">
    </div>
    <div class="w-48 h-screen bg-zinc-700 relative left-0 top-15 border-r-2 border-gray-500 flex flex-col items-center">
      <p class="text-xl text-purple-400 pt-2">Toolbox</p>
    </div>
    <div class="w-96 h-96 bg-white absolute top-[53px] left-48" id="container">
      <Svelvet id="my-canvas" width={1100} height={600} minimap>
        <Node bgColor="#ec4899" height={200} position={{ x: 100, y: 100 }} />
        <ThemeToggle main="dark" alt="light" slot="toggle"/>
        <Background dotColor="grey" bgColor="#27272a" gridWidth={40} dotSize={3} slot="background" />
      </Svelvet> 
    </div>
  </div>
</main>

