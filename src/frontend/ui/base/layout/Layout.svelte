<script lang="ts">
  import Panel from "./Panel.svelte";
  import { projectsStore } from "@frontend/lib/stores/ProjectStore";
  import { faFolder } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
  import { shortcutsRegistry } from "@frontend/lib/stores/ShortcutStore";

  const openProjectHotkeys = shortcutsRegistry.getFormattedShortcutsForActionReactive(
    "blix.projects.openProject"
  );
  const newProjectHotkeys = shortcutsRegistry.getFormattedShortcutsForActionReactive(
    "blix.projects.newProject"
  );
</script>

<div class="fullScreen">
  {#if $projectsStore.activeProject}
    {#key $projectsStore.activeProject.id}
      <Panel layout="{$projectsStore.activeProject.layout}" horizontal="{false}" height="100%" />
    {/key}
  {:else}
    <div class="placeholder select-none">
      <div class="icon"><Fa icon="{faFolder}" style="display: inline-block" /></div>
      <div class="flex space-x-2 pb-2">
        <h2 class="text-zinc-400">Open a project</h2>
        {#each $openProjectHotkeys as hotkey}
          <span
            class="flex flex-nowrap items-center rounded-md bg-zinc-700 px-2 text-sm text-zinc-300 shadow-inner"
          >
            {hotkey}
          </span>
        {/each}
      </div>
      <div class="flex space-x-2">
        <h2 class="text-zinc-400">Create a new project</h2>
        {#each $newProjectHotkeys as hotkey}
          <span
            class="flex flex-nowrap items-center rounded-md bg-zinc-700 px-2 text-sm text-zinc-300 shadow-inner"
          >
            {hotkey}
          </span>
        {/each}
      </div>
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
      font-size: 1em;
      color: #9090a4;
    }
  }
</style>
