<script lang="ts">
  import Panel from "./Panel.svelte";
  import { PanelGroup } from "./PanelNode";
  import Media from "./tiles/Media.svelte";
  import Graph from "./tiles/Graph.svelte";
  import { projectStore } from "../stores/ProjectStore";

  // let subLayout = new PanelGroup("2");
  // subLayout.addPanel("qwer", 0);
  // subLayout.addPanel("rewq", 0);
  // subLayout.addPanel("rewq", 0);

  // let layout = new PanelGroup("1");
  // layout.addPanel("graph", 1);
  // // layout.addPanelGroup(subLayout, 1);
  // layout.addPanel("image", 0);
  // // layout.recurseParent();

  let subLayout = new PanelGroup();
  // subLayout.addPanel(Media, 0);
  subLayout.addPanel(Graph, 0);
  subLayout.addPanel(Media, 0);

  let layout = new PanelGroup();
  // layout.addPanel(Graph, 0);
  layout.addPanelGroup(subLayout, 1);
  layout.addPanel(Media, 2);
  layout.recurseParent();
</script>

{#if $projectStore.activeProject}
  <Panel layout="{$projectStore.activeProject.layout}" horizontal="{false}" height="100%" />
{/if}
