<script lang="ts">
  import Panel from "./Panel.svelte";
  import { PanelGroup } from "./PanelNode";
  import { projectManager, type NewProjectStore } from "stores/ProjectStore";
  import { get } from "svelte/store";

  // let subLayout = new PanelGroup("2");
  // subLayout.addPanel("qwer", 0);
  // subLayout.addPanel("rewq", 0);
  // subLayout.addPanel("rewq", 0);

  // let layout = new PanelGroup("1");
  // layout.addPanel("graph", 1);
  // // layout.addPanelGroup(subLayout, 1);
  // layout.addPanel("image", 0);
  // layout.recurseParent();

  let subLayout = new PanelGroup();
  // subLayout.addPanel(Media, 0);
  // subLayout.addPanel(Graph, 0);
  // subLayout.addPanel(Media, 0);

  let layout = new PanelGroup();
  // layout.addPanel(Graph, 0);
  layout.addPanelGroup(subLayout, 1);
  // layout.addPanel(Media, 2);
  layout.recurseParent();

  let activeLayout: PanelGroup | null = null;
  let activeProjectStore: NewProjectStore | null = null;

  projectManager.subscribe((state) => {
    if (state.activeProject !== "") {
      activeProjectStore = projectManager.getActiveProject();
      activeLayout = get(activeProjectStore).layout;
    } else {
      activeLayout = null;
      activeProjectStore = null;
    }
  });
</script>

{#if activeLayout && activeProjectStore}
  <Panel layout="{activeLayout}" horizontal="{false}" height="100%" />
{/if}
