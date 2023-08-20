<script lang="ts">
  import { tileStore } from "../../lib/stores/TileStore";

  export let signature: string;

  const tile = tileStore.getTileReactive(signature);
  // console.log("signature", signature);
  console.log("TILE", $tile);

  const layouts: { [key: string]: string } = {
    "1": '[row1-start] "main" [row1-end] ',
    "2": '[row1-start] "main sidebar" [row1-end] / 1fr 80px',
    "4": '[row1-start] "sidebar main" [row1-end] / 80px 1fr',
    "3": '[row1-start] "main" [row1-end] [row2-start] "statusbar" 150px [row2-end]',
    "5": '[row1-start] "statusbar" 150px [row1-end] [row2-start] "main" [row2-end]',
    "6": '[row1-start] "main sidebar" [row1-end] [row2-start] "statusbar statusbar" 150px [row2-end] / 1fr 80px',
    "7": '[row1-start] "sidebar main" [row1-end] [row2-start] "statusbar statusbar" 150px [row2-end] / 80px 1fr',
    "8": '[row1-start] "statusbar statusbar" 150px [row1-end] [row2-start]  "main sidebar" [row2-end] / 1fr 80px',
    "9": '[row1-start] "statusbar statusbar" 150px [row1-end] [row2-start] "sidebar main" [row2-end] / 80px 1fr',
  };
</script>

<div class="container" style="grid:{layouts['1']};">
  <div class="main container" style="grid:{layouts['6']};">
    <div class="main container" style="grid:{layouts['9']};">
      <div class="main">
        <h1>main</h1>
      </div>
      <div class="sidebar">
        <h1>sidebar</h1>
      </div>
      <div class="statusbar">
        <h1>statusbar</h1>
      </div>
    </div>
    <div class="sidebar">
      <h1>sidebar</h1>
    </div>
    <div class="sidebar">
      <h1>sidebar</h1>
    </div>
    <div class="statusbar">
      <h1>statusbar</h1>
    </div>
  </div>
</div>

<style>
  .container {
    border: 1px solid white;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
  }

  .main {
    grid-area: main;
    border: 1px solid white;
  }

  .statusbar {
    grid-area: statusbar;
    border: 1px solid white;
  }

  .sidebar {
    grid-area: sidebar;
    border: 1px solid white;
  }
</style>
