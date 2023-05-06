<script lang="ts">
  import Panel from "./Panel.svelte";
  import { PanelGroup } from "./PanelNode";
  import Media from "./tiles/Media.svelte";
  import Graph from "./tiles/Graph.svelte";

  let subLayout = new PanelGroup();
  subLayout.addPanel(Media, 0);
  subLayout.addPanel(Graph, 0);
  subLayout.addPanel(Media, 0);

  let layout = new PanelGroup();
  layout.addPanel(Graph, 0);
  layout.addPanelGroup(subLayout, 1);
  layout.addPanel(Media, 2);
  layout.recurseParent();
</script>

<Panel layout="{layout}" horizontal="{true}" height="100%" />
