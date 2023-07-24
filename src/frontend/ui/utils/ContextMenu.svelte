<script>
  import { graphNodeMenuStore } from "../../lib/stores/ContextMenuStore";

  $: ({ isShowing, windowPos } = $graphNodeMenuStore);
</script>

{#if isShowing}
  <div
    class="fixed inset-x-0 z-50 h-32 w-32 bg-red-500"
    style:top="{$graphNodeMenuStore.windowPos.y}px"
    style:left="{$graphNodeMenuStore.windowPos.x}px"
  >
    Jake: [{$graphNodeMenuStore.windowPos.x}][{$graphNodeMenuStore.windowPos
      .y}][{$graphNodeMenuStore.isShowing}]
  </div>
{/if}

<style>
  .menu {
    background-color: red;
    position: absolute;
    width: 50px;
    height: 50px;
    z-index: 1000000;
  }
</style>
