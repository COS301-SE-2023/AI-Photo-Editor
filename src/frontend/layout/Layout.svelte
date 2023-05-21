<script lang="ts">
  import Panel from "./Panel.svelte";
  import { PanelGroup } from "./PanelNode";

  // let subLayout = new PanelGroup("2");
  // subLayout.addPanel("qwer", 0);
  // subLayout.addPanel("rewq", 0);
  // subLayout.addPanel("rewq", 0);

  let layout = new PanelGroup("1");
  layout.addPanel("graph", 1);
  // layout.addPanelGroup(subLayout, 1);
  layout.addPanel("image", 0);
  // layout.recurseParent();
</script>

<Panel layout="{layout}" horizontal="{false}" height="100%" />
