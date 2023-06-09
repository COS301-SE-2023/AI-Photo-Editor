<script lang="ts">
  import ProjectBar from "../components/ProjectBar.svelte";
</script>

<!-- The navbar at the top of the page -->
<div id="navbar" class="flex h-full w-full select-none items-center gap-2 bg-zinc-800 pl-20">
  <ProjectBar />
  <div class="draggable-region z-40 h-full grow"></div>
</div>

<style lang="postcss">
  .draggable-region {
    -webkit-app-region: drag;
  }

  .logo {
    color: #11111b;
    background-color: #94e2d5;
    padding: 0em 1em 0em;
  }
</style>
