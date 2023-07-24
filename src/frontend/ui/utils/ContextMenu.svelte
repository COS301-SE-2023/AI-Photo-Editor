<script>
  import { GlobalContextMenuStore } from "../../lib/stores/ContextMenuStore";
  let { isShowing, windowPos } = $GlobalContextMenuStore;
</script>

<!-- {#if $GlobalContextMenuStore.isShowing} -->
{#if isShowing}
  <div class="fixed left-[400px] top-[400px] z-50 h-24 w-24 bg-red-500">Jakes mom</div>
  <!-- <div id="menu" class="menu" style:left="{$GlobalContextMenuStore.windowPos.x}px",top="{$GlobalContextMenuStore.windowPos.y}px">
        MENU asdfasdfaf
    </div> -->
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
