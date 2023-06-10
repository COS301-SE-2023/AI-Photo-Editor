<script lang="ts">
  let projects = ["Project lakfdj lakdsfj aoipfdj kdajf 1", "Project 2"];
  let activeProject = 0;

  function addNewProject() {
    projects = [...projects, `Project ${projects.length + 1}`];
  }

  function closeProject(index: number) {
    projects.splice(index, 1);
    projects = projects;
  }

  function setAsActive(index: number) {
    activeProject = index;
  }
</script>

<div class="flex h-full w-full flex-row flex-nowrap items-center">
  {#each projects as project, i (i)}
    <div
      class="group flex h-full shrink basis-48 items-center overflow-hidden px-2 text-sm font-medium text-zinc-200
      {activeProject === i ? 'bg-zinc-900' : 'hover:bg-zinc-700'}"
      on:click="{() => setAsActive(i)}"
      on:keypress="{() => setAsActive(i)}"
    >
      <p class="mr-2 truncate">{project}</p>
      <svg
        on:click="{() => closeProject(i)}"
        on:keypress="{() => closeProject(i)}"
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
  <div on:click="{addNewProject}" on:keypress="{addNewProject}" class="flex-none pl-2">
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
