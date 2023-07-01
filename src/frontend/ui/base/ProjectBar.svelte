<script lang="ts">
  import { get } from "svelte/store";
  import { onDestroy } from "svelte";
  import type { Project } from "../../lib/Project";
  import { projectManager } from "lib/stores/ProjectStore";

  let projects: Project[] = [];

  const unsubscribe = projectManager.subscribe((state) => {
    projects = state.projectStores.map((store) => get(store));
  });

  onDestroy(unsubscribe);
</script>

<div class="drag flex h-full flex-row flex-nowrap items-center">
  {#each projects as project (project.uuid)}
    <div
      class="no-drag group flex h-full shrink basis-48 items-center overflow-hidden px-2 text-sm font-medium text-zinc-200
      {$projectManager.activeProject === project.uuid ? 'bg-zinc-900' : 'hover:bg-zinc-700'}"
      title="{project.name}"
      on:click="{() => projectManager.setActiveProject(project.uuid)}"
      on:keypress="{() => projectManager.setActiveProject(project.uuid)}"
    >
      <p class="mr-2 truncate">{project.name}</p>
      <svg
        on:click="{() => projectManager.closeProject(project.uuid)}"
        on:keypress="{() => projectManager.closeProject(project.uuid)}"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="ml-auto hidden h-5 w-5 shrink-0 rounded-md stroke-zinc-500 p-[0.1em] hover:bg-zinc-600 hover:stroke-red-400 group-hover:block"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </div>
  {/each}
  <div
    on:click="{projectManager.createProject}"
    on:keypress="{projectManager.createProject}"
    class="no-drag flex-none pl-2"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="h-6 w-6 rounded-md stroke-zinc-200 hover:bg-zinc-700"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path>
    </svg>
  </div>
</div>

<style lang="postcss">
  .no-drag {
    -webkit-app-region: no-drag;
  }
  .drag {
    -webkit-app-region: drag;
  }
</style>
