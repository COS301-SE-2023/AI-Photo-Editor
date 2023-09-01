<!-- A recursive splittable box for UI  -->

<!-- TODO:
    - Double click blip should maximize panel within its group
    - Left click _|_
    - Right click outward drag blip should swap panels
-->

<script lang="ts">
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import PanelBlip from "./PanelBlip.svelte";
  import { createEventDispatcher } from "svelte";
  import TileSelector from "./TileSelector.svelte";

  import Graph from "../../tiles/Graph.svelte";
  import Media from "../../tiles/Media.svelte";
  import Blank from "../../tiles/Blank.svelte";
  import Debug from "../../tiles/Debug.svelte";
  import WebView from "../../tiles/WebView.svelte";
  import Browser from "../../tiles/Browser.svelte";
  import ShortcutSettings from "../../tiles/ShortcutSettings.svelte";
  import { PanelGroup, PanelLeaf, type PanelNode } from "@frontend/lib/PanelNode";
  import type { PanelType } from "@shared/types";
  import { focusedPanelStore } from "../../../lib/PanelNode";
  import PanelBlipVane from "./PanelBlipVane.svelte";

  // import { scale } from "svelte/transition";

  const dispatch = createEventDispatcher();

  const minSize = 10;

  export let horizontal: boolean = false;
  export let height: string;
  export let isRoot = true;
  export let layout: PanelNode;

  let tileProps = {
    panelId: layout.id,
  };

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

  function slideOptions(
    e: any,
    index: number,
    dock: [dockV, dockH]
  ): { action: string | null; data: any } {
    const NOP = { action: null, data: {} };
    if (!(layout instanceof PanelGroup)) {
      return NOP;
    }

    blipVaneIcon = null;

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
        return {
          action: "addPanel",
          data: {
            content: thisLeafContent,
            index,
          },
        };

      case localDir.pl_o: // remove panel at index-1 if possible
        // Check which index to remove based on index direction
        let toRem = index + (iDir == indexDir.f ? 1 : -1);

        if (toRem >= 0 && toRem < layout.panels.length) {
          return {
            action: "removePanel",
            data: {
              toRem: toRem,
              index,
            },
          };
        }

        return NOP;

      case localDir.pp_i: // encapsulate panel within panelgroup, add another panel to group
        return {
          action: "tunnelAndSplit",
          data: {
            content: thisLeafContent,
            index,
          },
        };

      case localDir.pp_o: // invalid

      default:
        return NOP;
    }
  }

  function handleBlipDragged(e: any, index: number, dock: [dockV, dockH]) {
    if (!(layout instanceof PanelGroup)) {
      return;
    }

    resetBlipVane();

    const selection = slideOptions(e, index, dock);

    switch (selection.action) {
      case "addPanel":
        layout.addPanel(selection.data.content, selection.data.index);
        layout = layout; // Force update
        break;
      case "removePanel":
        // layout.getPanel(selection.data.toRem).size = -1;

        layout.removePanel(selection.data.toRem);

        // layout = layout;
        bubbleToRoot();
        break;
      case "tunnelAndSplit":
        let group = new PanelGroup(undefined, layout.getPanel(selection.data.index).id);

        //Add this panel
        group.addPanel(selection.data.content, 0);
        //Add new panel
        group.addPanel(selection.data.content, 1);
        // Replace this panel with new group
        layout.setPanel(group, selection.data.index);

        layout = layout; // Force update
        break;
      default:
        break;
    }

    return;
  }

  let blipVaneIcon: string | null = null;
  let blipVaneIndex: number | null = -1;

  function resetBlipVane() {
    blipVaneIcon = null;
    blipVaneIndex = -1;
  }

  function handleBlipDragging(e: any, index: number, dock: [dockV, dockH]) {
    const selection = slideOptions(e, index, dock);

    switch (selection.action) {
      case "addPanel":
        // blipVaneIcon = "+";
        blipVaneIcon = e.detail.dir;
        blipVaneIndex = selection.data.index;
        break;
      case "removePanel":
        blipVaneIcon = "x";
        blipVaneIndex = selection.data.toRem;
        break;
      case "tunnelAndSplit":
        blipVaneIcon = ["u", "d"].includes(e.detail.dir) ? "|" : "-";
        blipVaneIndex = selection.data.index;
        break;
      default:
        blipVaneIcon = null;
        blipVaneIndex = -1;
        break;
    }
  }

  // This dict defines mappings from PanelType to the corresponding Svelte component to render
  const panelTypeToComponent: Record<PanelType, ConstructorOfATypedSvelteComponent> = {
    graph: Graph,
    media: Media,
    debug: Debug,
    webview: WebView,
    browser: Browser,
    shortcutSettings: ShortcutSettings,
  };

  // Wraps the above dict safely
  function getComponentForPanelType(panelType: PanelType): ConstructorOfATypedSvelteComponent {
    if (panelType in panelTypeToComponent) {
      return panelTypeToComponent[panelType];
    } else {
      console.error(`No component found for panel type '${panelType}'`);
      return Blank;
    }
  }
</script>

{#if layout instanceof PanelGroup}
  <!-- <div class="container"> -->
  <Splitpanes
    class="main-theme"
    horizontal="{horizontal}"
    style="{height == '' ? '' : 'height: {height}'}"
    dblClickSplitter="{false}"
    on:pane-remove="{(e) => e.stopPropagation()}"
  >
    {#each layout.panels as panel, i (panel.id)}
      <!-- TODO: Fix; look into using svelte animations -->
      {#key layout}
        <!-- Look into using #key instead of bubbleToRoot + transition: scale -->
      {/key}
      <Pane minSize="{panel.size == -1 ? 0 : minSize}" bind:size="{panel.size}">
        {#if panel instanceof PanelLeaf}
          <PanelBlip
            dock="tl"
            on:blipDragged="{(e) => handleBlipDragged(e, i, [dockV.t, dockH.l])}"
            on:blipDragging="{(e) => handleBlipDragging(e, i, [dockV.t, dockH.l])}"
            on:blipReleased="{resetBlipVane}"
          />
          <PanelBlip
            dock="tr"
            on:blipDragged="{(e) => handleBlipDragged(e, i, [dockV.t, dockH.r])}"
            on:blipDragging="{(e) => handleBlipDragging(e, i, [dockV.t, dockH.r])}"
            on:blipReleased="{resetBlipVane}"
          />
          <PanelBlip
            dock="bl"
            on:blipDragged="{(e) => handleBlipDragged(e, i, [dockV.b, dockH.l])}"
            on:blipDragging="{(e) => handleBlipDragging(e, i, [dockV.b, dockH.l])}"
            on:blipReleased="{resetBlipVane}"
          />
          <PanelBlip
            dock="br"
            on:blipDragged="{(e) => handleBlipDragged(e, i, [dockV.b, dockH.r])}"
            on:blipDragging="{(e) => handleBlipDragging(e, i, [dockV.b, dockH.r])}"
            on:blipReleased="{resetBlipVane}"
          />
          <TileSelector bind:type="{panel.content}" />
          <!-- Subpanels alternate horiz/vert -->
        {/if}

        <!-- TODO: Fix - for some reason this occasionally causes issues with panel deletion -->
        <!-- A temp workaround that seems to hold up better is awaiting tick() in PanelGroup removePanel() -->
        <!-- {#if blipVaneIcon && i === blipVaneIndex}
          {#key blipVaneIcon}
            <PanelBlipVane icon={blipVaneIcon} />
          {/key}
        {/if} -->

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
  <!-- </div> -->
{:else if layout instanceof PanelLeaf}
  <!-- Actual panel content goes here -->
  <!-- When a panel is clicked, a store is updated to hold the focussed panel -->
  <div
    class="fullPanel"
    on:click="{() => {
      focusedPanelStore.focusOnPanel(layout.id);
    }}"
    on:keydown="{null}"
  >
    <!-- {#if layout.content === "graph"}
      <Graph />
    {:else if layout.content === "image"}
      <div class="flex h-full w-full items-center justify-center p-5">
        <Image />
      </div>
    {/if} -->
    <!-- {layout.content} -->
    <svelte:component this="{getComponentForPanelType(layout.content)}" {...tileProps} />
  </div>
{/if}

<style global>
  .fullPanel {
    width: 100%;
    height: 100%;
    /* padding: 0.4em 1.2em; */
  }

  .container {
    width: 100%;
    height: 100%;
    padding: 0px;
    margin: 0px;
  }

  .splitpanes.main-theme .splitpanes__splitter {
    background-color: #11111b;
    border: none;
    transition: all 0.3s ease-in-out;
  }

  .splitpanes.main-theme .splitpanes__splitter:active {
    background-color: rgb(244 63 94 / 0.7);
    border: none;
  }

  .splitpanes.main-theme .splitpanes__splitter:hover {
    background-color: rgb(244 63 94 / 0.7);
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
