<script lang="ts">
  // import { PanelGroup } from "@frontend/lib/PanelNode";
  import Panel from "./Panel.svelte";
  // import { projectManager, type NewProjectStore } from "@frontend/lib/stores/ProjectStore";
  // import { get } from "svelte/store";
  import { projectsStore } from "@frontend/lib/stores/ProjectStore";

  // let subLayout = new PanelGroup("2");
  // subLayout.addPanel("qwer", 0);
  // subLayout.addPanel("rewq", 0);
  // subLayout.addPanel("rewq", 0);

  // let layout = new PanelGroup("1");
  // layout.addPanel("graph", 1);
  // // layout.addPanelGroup(subLayout, 1);
  // layout.addPanel("image", 0);
  // layout.recurseParent();

  // let subLayout = new PanelGroup();
  // // subLayout.addPanel(Media, 0);
  // // subLayout.addPanel(Graph, 0);
  // // subLayout.addPanel(Media, 0);

  // let layout = new PanelGroup();
  // // layout.addPanel(Graph, 0);
  // layout.addPanelGroup(subLayout, 1);
  // // layout.addPanel(Media, 2);
  // layout.recurseParent();

  // let activeLayout: PanelGroup | null = null;
  // let activeProjectStore: NewProjectStore | null = null;

  // projectManager.subscribe((state) => {
  //   if (state.activeProject !== "") {
  //     activeProjectStore = projectManager.getActiveProject();
  //     activeLayout = get(activeProjectStore).layout;
  //   } else {
  //     activeLayout = null;
  //     activeProjectStore = null;
  //   }
  // })A;
  // $: {
  //   if($projectsStore.activeProject) {
  //     console.log("New active project")
  //     $projectsStore.activeProject.layout;
  //     console.log("New layout")
  //     projectsStore.updateLayout($projectsStore.activeProject.id);
  //   }
  // }
</script>

<!-- {#if activeLayout && activeProjectStore}
  <Panel layout="{activeLayout}" horizontal="{false}" height="100%" />
{/if} -->

{#if $projectsStore.activeProject}
  {#key $projectsStore.activeProject.id}
    <div class="fullScreen">
      <Panel layout="{$projectsStore.activeProject.layout}" horizontal="{false}" height="100%" />
    </div>
  {/key}
{/if}

<style>
  .fullScreen {
    padding: 0px;
    margin: 0px;
    height: 100%;
    width: 100%;
  }
</style>
