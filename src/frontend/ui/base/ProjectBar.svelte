<script lang="ts">
  import { projectsStore } from "@frontend/lib/stores/ProjectStore";
  import Shortcuts from "../utils/Shortcuts.svelte";
  import { onMount, tick } from "svelte";

  function createProject() {
    projectsStore.createProject();
  }

  const shortcuts = {
    "blix.projects.newProject": () => {
      createProject();
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
      class="no-drag group flex h-full shrink basis-48 items-center overflow-hidden rounded-t-xl px-2 text-sm font-medium text-zinc-200
        {$projectsStore.activeProject?.id === project.id ? 'bg-zinc-900' : 'hover:bg-zinc-700'}"
      title="{project.name}"
      on:click="{() => projectsStore.setActiveProject(project.id)}"
      on:keypress="{() => projectsStore.setActiveProject(project.id)}"
    >
      <p class="mr-2 truncate">{project.name}</p>
      <svg
        on:click="{() => projectsStore.closeProject(project.id)}"
        on:keypress="{() => projectsStore.closeProject(project.id)}"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="ml-auto h-5 w-5 shrink-0 rounded-md stroke-zinc-500 p-[0.1em] hover:bg-zinc-600 hover:stroke-rose-500/70"
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
      class="h-6 w-6 rounded-md stroke-zinc-400 hover:bg-zinc-700"
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
