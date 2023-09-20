<script lang="ts">
  export let title: string = "Title";
  export let onClick: () => void;
</script>

<div
  class="flex h-8 flex-nowrap items-center rounded-md border-none bg-zinc-700/[0.75] px-2 text-sm font-medium text-zinc-200 shadow-md transition duration-300 ease-in-out hover:bg-zinc-600 hover:text-white"
  title="Check for updates"
  on:click="{() => onClick()}"
  on:keydown="{() => onClick}"
>
  {title}
</div>
