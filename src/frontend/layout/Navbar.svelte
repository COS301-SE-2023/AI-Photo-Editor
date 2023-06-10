<script lang="ts">
  import ProjectBar from "../components/Projects/ProjectBar.svelte";
</script>

<!-- The navbar at the top of the page -->
<div
  id="navbar"
  class="draggable-region flex h-full w-full select-none items-center bg-zinc-800 pr-10"
>
  <div class="project-bar h-full grow">
    <ProjectBar />
  </div>
</div>

<style lang="postcss">
  .draggable-region {
    -webkit-app-region: drag;
    pointer-events: none;
  }

  #navbar {
  }

  .project-bar {
    -webkit-app-region: no-drag;
    pointer-events: auto;
  }

  .logo {
    color: #11111b;
    background-color: #94e2d5;
    padding: 0em 1em 0em;
  }
</style>
