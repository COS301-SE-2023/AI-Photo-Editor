<!-- Allows multiple tiles to occupy the same space and accessed using a tabbed ribbon -->
<script>
  import { SvelteComponent } from "svelte";

  let selected = 0;

  export let panels = [SvelteComponent];
</script>

<!-- TODO -->
<ul class="tabs">
  {#each panels as panel, i}
    <li class="{selected == i ? 'tab selected' : 'tab'}">
      <svelte:component this="{panel.component}" />
    </li>
  {/each}
</ul>

<style>
  .tabs {
  }

  .tab {
  }

  .selected {
  }
</style>
