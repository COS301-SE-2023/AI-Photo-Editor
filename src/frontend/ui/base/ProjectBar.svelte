<script lang="ts">
  import { projectsStore } from "@frontend/lib/stores/ProjectStore";
  // import Shortcuts from "../utils/Shortcuts.svelte";
  // import { registerShortcuts } from "../../lib/Shortcuts";

  let count = 0;
  function createProject() {
    projectsStore.createProject();
  }

  function draggable(node: HTMLElement) {
    // let state = params;
    node.draggable = true;
    node.style.cursor = "grab";
  }

  // projectsStore.subscribe((state) => {
  //   alert(`ProjectsStore changed`);
  // });

  function subscribeToProject(id: string) {
    alert("Subscribing to project...");
    const projectStore = projectsStore.getProjectStore(id);
    projectStore.subscribe((state) => {
      console.log(`Project ${state?.name} [${state?.id}] changed`);
    });
  }

  function changeName(id: string) {
    projectsStore.changeName(`Hello World ${count++}`, id);
  }

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
      class="no-drag group flex h-full shrink basis-48 items-center overflow-hidden px-2 text-sm font-medium text-zinc-200
      {$projectsStore.activeProject?.id === project.id ? 'bg-zinc-900' : 'hover:bg-zinc-700'}"
      title="{project.name}"
      on:click="{() => projectsStore.setActiveProject(project.id)}"
      on:keypress="{() => projectsStore.setActiveProject(project.id)}"
      on:dblclick="{() => changeName(project.id)}"
      on:contextmenu|preventDefault="{() => subscribeToProject(project.id)}"
      use:draggable
    >
      <p class="mr-2 truncate">{project.name}</p>
      <svg
        on:click="{() => projectsStore.closeProject(project.id)}"
        on:keypress="{() => projectsStore.closeProject(project.id)}"
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
  <div on:click="{createProject}" on:keypress="{createProject}" class="no-drag flex-none pl-2">
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

<!-- <Shortcuts {shortcuts} /> -->

<style lang="postcss">
  .no-drag {
    -webkit-app-region: no-drag;
  }
  .drag {
    -webkit-app-region: drag;
  }
</style>
