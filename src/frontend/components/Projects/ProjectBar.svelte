<script lang="ts">
  import { projectStore } from "../../stores/ProjectStore";
  import { Project } from "./Project";
  import { PanelGroup } from "../../layout/PanelNode";

  let count = 0;

  function addNewProject() {
    let layout = new PanelGroup("1");
    layout.addPanel("graph", 1);
    layout.addPanel("image", 0);
    const project = new Project("Project", (count++).toString(), layout);
    projectStore.addProject(project);
    projectStore.setActiveProject(project.id);
  }
</script>

<div class="drag flex h-full flex-row flex-nowrap items-center">
  {#each $projectStore.projects as project (project.id)}
    <div
      class="no-drag group flex h-full shrink basis-48 items-center overflow-hidden px-2 text-sm font-medium text-zinc-200
      {$projectStore.activeProject && $projectStore.activeProject.id === project.id
        ? 'bg-zinc-900'
        : 'hover:bg-zinc-700'}"
      title="{project.name}"
      on:click="{() => projectStore.setActiveProject(project.id)}"
      on:keypress="{() => projectStore.setActiveProject(project.id)}"
    >
      <p class="mr-2 truncate">{project.name}</p>
      <svg
        on:click="{() => projectStore.removeProject(project.id)}"
        on:keypress="{() => projectStore.removeProject(project.id)}"
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
  <div on:click="{addNewProject}" on:keypress="{addNewProject}" class="no-drag flex-none pl-2">
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
