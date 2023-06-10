<script lang="ts">
  import ProjectBar from "../components/Projects/ProjectBar.svelte";
</script>

<!-- The navbar at the top of the page -->
<div id="navbar" class="drag flex h-full w-full select-none items-center bg-zinc-800 pr-10">
  <div class="h-full w-full">
    <ProjectBar />
  </div>
</div>

<style lang="postcss">
  .drag {
    -webkit-app-region: drag;
  }
</style>
