<script lang="ts">
  import { projectsStore } from "../../lib/stores/ProjectStore";
  import { toastStore } from "../../lib/stores/ToastStore";
  import GraphSelectionBox from "../utils/graph/SelectionBox.svelte";

  let logs: any[] = [];
  let count = 0;

  const createProject = async () => {
    await projectsStore.createProject();
    logAction("Project created");
  };

  const logAction = (action: any) => {
    logs = [action, ...logs];
  };
</script>

<section class="flex h-full w-full flex-row items-center justify-center space-x-8 bg-gray-800">
  <section class="flex min-h-[400px] min-w-[150px] flex-col items-center">
    <span class="pb-3 text-xl text-purple-700">Actions</span>
    <div class="flex flex-col items-center space-y-2">
      <span
        class="rounded-md bg-zinc-400 p-2 hover:cursor-pointer hover:bg-zinc-500"
        on:click="{createProject}"
        on:keydown="{createProject}"
      >
        Create new project
      </span>
      <span
        class="rounded-md bg-zinc-400 p-2 hover:cursor-pointer hover:bg-zinc-500"
        on:click="{() => toastStore.trigger({ message: `Hello Jake ${count++}`, type: 'success' })}"
        on:keydown="{null}"
      >
        Add toast success
      </span>
      <span
        class="rounded-md bg-zinc-400 p-2 hover:cursor-pointer hover:bg-zinc-500"
        on:click="{() => toastStore.trigger({ message: `Hello Jake ${count++}`, type: 'error' })}"
        on:keydown="{null}"
      >
        Add toast error
      </span>
      <span
        class="rounded-md bg-zinc-400 p-2 hover:cursor-pointer hover:bg-zinc-500"
        on:click="{() => toastStore.trigger({ message: `Hello Jake ${count++}`, type: 'warn' })}"
        on:keydown="{null}"
      >
        Add toast warn
      </span>
      <span
        class="rounded-md bg-zinc-400 p-2 hover:cursor-pointer hover:bg-zinc-500"
        on:click="{() => toastStore.trigger({ message: `Hello Jake ${count++}`, type: 'info' })}"
        on:keydown="{null}"
      >
        Add toast info
      </span>
    </div>
  </section>
  <section class="flex h-[400px] min-w-[150px] flex-col items-center">
    <span class="pb-3 text-xl text-purple-700">Log</span>
    <div class="no-scrollbar flex flex-col items-center space-y-2 overflow-y-auto text-zinc-400">
      {#each $projectsStore.projects as project (project.id)}
        <span>{project.id}</span>
      {/each}
    </div>
  </section>
  <GraphSelectionBox />
</section>

<style lang="postcss">
  /* Hide scrollbar for Chrome, Safari and Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
</style>
