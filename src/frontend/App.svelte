<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>

<script lang="ts">
  let name = "Jake";
</script>

<main>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-3xl md:text-5xl text-orange-500 font-bold mb-5">Hello {name}!</h1>
  </div>
</main>
