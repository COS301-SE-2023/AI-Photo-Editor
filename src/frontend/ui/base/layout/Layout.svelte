<script lang="ts">
  import Panel from "./Panel.svelte";
  import { projectsStore } from "@frontend/lib/stores/ProjectStore";
  import { faDiagramProject } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
</script>

<div class="fullScreen">
  {#if $projectsStore.activeProject}
    {#key $projectsStore.activeProject.id}
      <Panel layout="{$projectsStore.activeProject.layout}" horizontal="{false}" height="100%" />
    {/key}
  {:else}
    <div class="placeholder select-none">
      <div class="icon"><Fa icon="{faDiagramProject}" style="display: inline-block" /></div>
      <h1>No projects!</h1>
      <h2>Create a project to begin creating</h2>
    </div>
  {/if}
</div>

<style lang="scss">
  .fullScreen {
    padding: 0px;
    margin: 0px;
    height: 100%;
    width: 100%;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    h1 {
      font-size: 1.5em;
      color: #a8a8be;
    }

    .icon {
      width: 100%;
      color: #9090a4;
      font-size: 5em;
      line-height: 1em;
      margin-bottom: 0.1em;
    }

    h2 {
      font-size: 0.8em;
      color: #9090a4;
    }
  }
</style>
