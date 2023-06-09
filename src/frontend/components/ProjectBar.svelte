<script lang="ts">
  let projects = ["Project 1"];
  // let projectAddBtn: HTMLElement;

  function addNewProject() {
    projects = [...projects, `Project ${projects.length + 1}`];
  }
</script>

{#each projects as project}
  <div class="group flex h-full items-center gap-2 px-2 text-sm text-zinc-200 hover:bg-zinc-700">
    <p>{project}</p>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="ml-auto h-5 w-5 rounded-md stroke-zinc-500 p-[0.1em] opacity-0 hover:bg-zinc-600 hover:stroke-red-400 group-hover:opacity-100"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  </div>
{/each}
<div on:click="{addNewProject}" on:keypress="{addNewProject}">
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
