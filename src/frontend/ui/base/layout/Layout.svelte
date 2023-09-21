<script lang="ts">
  import Panel from "./Panel.svelte";
  import { projectsStore } from "@frontend/lib/stores/ProjectStore";
</script>

<div class="fullScreen">
  {#if $projectsStore.activeProject}
    {#key $projectsStore.activeProject.id}
      <Panel layout="{$projectsStore.activeProject.layout}" horizontal="{false}" height="100%" />
    {/key}
  {/if}
</div>

<style>
  .fullScreen {
    padding: 0px;
    margin: 0px;
    height: 100%;
    width: 100%;
  }
</style>
