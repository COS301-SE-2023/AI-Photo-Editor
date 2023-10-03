<script lang="ts">
  import { projectsStore } from "@frontend/lib/stores/ProjectStore";
  import Shortcuts from "../utils/Shortcuts.svelte";
  import { onMount, tick } from "svelte";
  import { fade } from "svelte/transition";
  import { commandStore } from "../../lib/stores/CommandStore";

  function createProject() {
    projectsStore.createProject();
  }

  const shortcuts = {
    "blix.projects.newProject": () => {
      createProject();
    },
    "blix.projects.save": () => {
      if ($projectsStore.activeProject) commandStore.runCommand("blix.projects.save");
    },
  };

  onMount(async () => {
    await tick();
    createProject();
  });

  // TODO: Fix when shortcuts is fixed
  // registerShortcuts({
  //   "blix.projects.newProject": () => {
  //     projectsStore.createProject();
  //   },
  //   "blix.projects.closeActiveProject": () => {
  //     projectsStore.closeProject($projectsStore.activeProject?.id || "");
  //   },
  // });
</script>

<div class="drag flex h-full flex-row flex-nowrap items-center">
  {#each $projectsStore.projects as project (project.id)}
    <div
      class="no-drag group flex h-full shrink basis-48 items-center overflow-hidden px-2 text-xs font-medium text-zinc-200
        {$projectsStore.activeProject?.id === project.id ? 'bg-zinc-900' : 'hover:bg-zinc-700'}"
      title="{project.name}"
      on:click="{() => projectsStore.setActiveProject(project.id)}"
      on:keypress="{null}"
    >
      {#if !project.saved}
        <div
          transition:fade|local="{{ duration: 150 }}"
          class="z-1000000 mr-2 h-[10px] w-[10px] rounded-full border-[1px] border-zinc-600 bg-primary-500"
        ></div>
      {/if}

      <p class="mr-2 truncate">{project.name}</p>
      <svg
        on:click|stopPropagation="{() => projectsStore.closeProject(project.id)}"
        on:keypress="{null}"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="ml-auto h-4 w-4 shrink-0 rounded-md stroke-zinc-500 p-[0.1em] hover:bg-zinc-600 hover:stroke-primary-500/70"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </div>
  {/each}
  <div on:click="{createProject}" on:keypress="{createProject}" class="no-drag flex-none pl-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.8"
      stroke="currentColor"
      class="h-4 w-4 rounded-md stroke-zinc-400 hover:bg-zinc-700"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path>
    </svg>
  </div>
</div>

<Shortcuts shortcuts="{shortcuts}" />

<!-- <Shortcuts {shortcuts} /> -->

<style lang="postcss">
  .no-drag {
    -webkit-app-region: no-drag;
  }
  .drag {
    -webkit-app-region: drag;
  }
</style>
