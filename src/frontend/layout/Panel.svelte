<!-- A recursive splittable box for UI  -->

<!-- TODO:
    - Double click blip should maximize panel within its group
    - Left click _|_
    - Right click outward drag blip should swap panels
-->

<script lang="ts">
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { PanelNode, PanelGroup, PanelLeaf } from "./PanelNode";
  import PanelBlip from "./PanelBlip.svelte";
  import { createEventDispatcher } from "svelte";
  import TileSelector from "./TileSelector.svelte";

  const dispatch = createEventDispatcher();

  const minSize = 10;

  export let horizontal: boolean = false;
  export let layout: PanelNode;
  export let height: string;
  export let isRoot = true;

  enum dockV {
    "t",
    "b",
  }
  enum dockH {
    "l",
    "r",
  }

  // Hail Mary for when local assignment does not correctly update svelte components
  function bubbleToRoot() {
    if (!isRoot) {
      dispatch("bubbleToRoot");
    } else {
      layout = layout;
    }
  }

  // (Parallel/Perpendicular)_(in/out)
  enum localDir {
    "pl_i",
    "pl_o",
    "pp_i",
    "pp_o",
    null,
  }

  // Forwards/Backwards relative to the direction of increasing panel indices
  enum indexDir {
    "f",
    "b",
  }

  // Map blip drag dir to localDir based on tile orientation & blip dock
  function localize(dir: string, dock: [dockV, dockH]): localDir {
    if (horizontal) {
      // Pane split is horizontal, tiles run vertically
      switch (dir) {
        case "u":
          return dock[0] == dockV.t ? localDir.pl_o : localDir.pl_i;
        case "d":
          return dock[0] == dockV.t ? localDir.pl_i : localDir.pl_o;

        case "l":
          return dock[1] == dockH.l ? localDir.pp_o : localDir.pp_i;
        case "r":
          return dock[1] == dockH.l ? localDir.pp_i : localDir.pp_o;
      }
    } else {
      //Pane split is vertical, tiles run horizontally
      switch (dir) {
        case "u":
          return dock[0] == dockV.t ? localDir.pp_o : localDir.pp_i;
        case "d":
          return dock[0] == dockV.t ? localDir.pp_i : localDir.pp_o;

        case "l":
          return dock[1] == dockH.l ? localDir.pl_o : localDir.pl_i;
        case "r":
          return dock[1] == dockH.l ? localDir.pl_i : localDir.pl_o;
      }
    }
    return localDir.null;
  }

  function handleBlipDrag(e: any, index: number, dock: [dockV, dockH]) {
    if (!(layout instanceof PanelGroup)) {
      return;
    }

    let dir = e.detail.dir;

    // Transform u/d/l/r direction to local direction within PaneGroup
    let slide: localDir = localize(dir, dock);

    let iDir: indexDir = horizontal
      ? dir == "d"
        ? indexDir.f
        : indexDir.b
      : dir == "r"
      ? indexDir.f
      : indexDir.b;

      // Get the content in this panel leaf
      const thisLeafContent = (layout.panels[index] as PanelLeaf).content;

    // Perform panel operation
    switch (slide) {
      case localDir.pl_i: // add panel at index
        layout.addPanel(thisLeafContent, index);
        layout = layout; // Force update
        break;

      case localDir.pl_o: // remove panel at index-1 if possible
        // Check which index to remove based on index direction
        let toRem = index + (iDir == indexDir.f ? 1 : -1);

        if (toRem >= 0 && toRem < layout.panels.length) {
          layout.removePanel(toRem);
          layout = layout;

          bubbleToRoot();
        }

        break;

      case localDir.pp_i: // encapsulate panel within panelgroup, add another panel to group
        let group = new PanelGroup();

        //Add this panel
        group.addPanel(thisLeafContent, 0);
        //Add new panel
        group.addPanel(thisLeafContent, 1);
        // Replace this panel with new group
        layout.setPanel(group, index);

        layout = layout; // Force update
        break;

      case localDir.pp_o: // invalid

      default:
        return;
    }
  }
</script>

{#if layout instanceof PanelGroup}
  <Splitpanes
    class="main-theme"
    horizontal="{horizontal}"
    style="{height == '' ? '' : 'height: {height}'}"
    dblClickSplitter="{false}"
  >
    {#each layout.panels as panel, i}
      <Pane minSize="{minSize}">
        {#if panel instanceof PanelLeaf}
          <PanelBlip dock="tl" on:blipDragged="{(e) => handleBlipDrag(e, i, [dockV.t, dockH.l])}" />
          <PanelBlip dock="tr" on:blipDragged="{(e) => handleBlipDrag(e, i, [dockV.t, dockH.r])}" />
          <PanelBlip dock="bl" on:blipDragged="{(e) => handleBlipDrag(e, i, [dockV.b, dockH.l])}" />
          <PanelBlip dock="br" on:blipDragged="{(e) => handleBlipDrag(e, i, [dockV.b, dockH.r])}" />
            <TileSelector />
        {/if}
        <!-- Subpanels alternate horiz/vert -->
        <svelte:self
          on:bubbleToRoot="{bubbleToRoot}"
          layout="{panel}"
          isRoot="{false}"
          horizontal="{!horizontal}"
          height="100px"
        />
      </Pane>
    {/each}
  </Splitpanes>
{:else if layout instanceof PanelLeaf}
  <!-- Actual panel content goes here -->
  <div class="fullPanel">
    <svelte:component this={layout.content} />
  </div>
{/if}

<style global>
  .fullPanel {
    width: 100%;
    height: 100%;
    /* padding: 0.4em 1.2em; */
  }

  .splitpanes.main-theme .splitpanes__splitter {
    background-color: #11111b;
    border: none;
  }

  .splitpanes.main-theme .splitpanes__pane {
    color: #cdd6f4;
    background-color: #181825;
  }

  .main-theme {
    background-color: #11111b;
  }
</style>
