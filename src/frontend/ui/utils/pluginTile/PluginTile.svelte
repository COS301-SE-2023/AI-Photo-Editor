<script lang="ts">
  import type { TileUIParent, UIComponentConfig } from "../../../../shared/ui/TileUITypes";
  import TileUiFragment from "./TileUIFragment.svelte";
  import WebView from "../../tiles/WebView.svelte";

  // export let type: string = "";
  export let componentUI: { [key: string]: TileUIParent | null } = {};
  export let uiConfigs: { [key: string]: UIComponentConfig } = {};

  const layouts: { [key: string]: string } = {
    "1": '[row1-start] "main" [row1-end] ',
    "2": '[row1-start] "main sidebar" [row1-end] / 1fr 80px',
    "3": '[row1-start] "sidebar main" [row1-end] / 80px 1fr',
    "4": '[row1-start] "main" 1fr [row1-end] [row2-start] "statusbar" 150px [row2-end]',
    "5": '[row1-start] "statusbar" 150px [row1-end] [row2-start] "main" 1fr [row2-end]',
    "6": '[row1-start] "main sidebar" 1fr [row1-end] [row2-start] "statusbar statusbar" 150px [row2-end] / 1fr 80px',
    "7": '[row1-start] "sidebar main" 1fr [row1-end] [row2-start] "statusbar statusbar" 150px [row2-end] / 80px 1fr',
    "8": '[row1-start] "statusbar statusbar" 150px [row1-end] [row2-start]  "main sidebar" 1fr [row2-end] / 1fr 80px',
    "9": '[row1-start] "statusbar statusbar" 150px [row1-end] [row2-start] "sidebar main" 1fr [row2-end] / 80px 1fr',
  };

  function getLayout(ui: { [key: string]: TileUIParent | null }): string {
    if (ui["main"] && !ui["sidebar"] && !ui["statusbar"]) return "1";
    if (ui["main"] && ui["sidebar"] && !ui["statusbar"] && ui["sidebar"].location === "right")
      return "2";
    if (ui["main"] && ui["sidebar"] && !ui["statusbar"] && ui["sidebar"].location === "left")
      return "3";
    if (ui["main"] && !ui["sidebar"] && ui["statusbar"] && ui["statusbar"].location == "bottom")
      return "4";
    if (ui["main"] && !ui["sidebar"] && ui["statusbar"] && ui["statusbar"].location == "top")
      return "5";
    if (
      ui["main"] &&
      ui["sidebar"] &&
      ui["statusbar"] &&
      ui["sidebar"].location == "right" &&
      ui["statusbar"].location == "bottom"
    )
      return "6";
    if (
      ui["main"] &&
      ui["sidebar"] &&
      ui["statusbar"] &&
      ui["sidebar"].location == "left" &&
      ui["statusbar"].location == "bottom"
    )
      return "7";
    if (
      ui["main"] &&
      ui["sidebar"] &&
      ui["statusbar"] &&
      ui["sidebar"].location == "right" &&
      ui["statusbar"].location == "top"
    )
      return "8";
    if (
      ui["main"] &&
      ui["sidebar"] &&
      ui["statusbar"] &&
      ui["sidebar"].location == "left" &&
      ui["statusbar"].location == "top"
    )
      return "9";
    return "1";
  }
</script>

<div class="container" style="grid: {layouts[getLayout(componentUI)]}">
  {#if componentUI["main"]}
    <div class="main">
      {#if componentUI["main"].childUis}
        <svelte:self
          componentUI="{componentUI['main'].childUis.ui}"
          uiConfigs="{componentUI['main'].childUis.uiConfigs}"
        />
      {:else}
        <WebView media="" />
      {/if}
    </div>
  {/if}
  {#if componentUI["sidebar"]}
    <div class="sidebar border border-zinc-500">
      <TileUiFragment ui="{componentUI['sidebar']}" uiConfigs="{uiConfigs}" />
    </div>
  {/if}
  {#if componentUI["statusbar"]}
    <div class="statusbar overflow-clip border border-zinc-500">
      <TileUiFragment ui="{componentUI['statusbar']}" uiConfigs="{uiConfigs}" />
    </div>
  {/if}
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
  }

  .main {
    grid-area: main;
    border-radius: 10px;
  }

  .statusbar {
    grid-area: statusbar;
    padding: 5px;
    margin: 5px;
    border-radius: 10px;
  }

  .sidebar {
    grid-area: sidebar;
    padding: 5px;
    margin: 5px;
    border-radius: 10px;
  }
</style>
