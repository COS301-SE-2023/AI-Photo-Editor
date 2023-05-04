<!-- A recursive splittable box for UI  -->
<script lang="ts">
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import { PanelNode, PanelGroup, PanelLeaf } from "./PanelNode";
    import PanelBlip from "./PanelBlip.svelte";
    const minSize = 10;

    export let horizontal: boolean = false;
    export let layout: PanelNode;
    export let height: string;

    function handleBlipDrag(e: any, index: number) {
        let dir = e.detail.dir;
        console.log(dir + " " + index);
        if (dir == "d") {
            addPanel();
        }
        else if (dir == "u") {
            removePanel();
        }
        else if (dir == "r") {
            addPanelGroup();
        }
    }

    // Split the current pane into two
    function addPanel() {
        if (layout instanceof PanelGroup) {
            layout.addPanel(Math.random().toString());
            layout = layout; // Force update
        }
    }
    function removePanel() {
        if (layout instanceof PanelGroup) {
            layout.removePanel(1);
            layout = layout; // Force update
        }
    }
    function addPanelGroup() {
        if (layout instanceof PanelGroup) {
            let group = new PanelGroup("new");
            group.addPanel("asdf");
            layout.addPanelGroup(group);

            layout = layout; // Force update
        }
    }
</script>

<style>
    .full {
        width: 100%;
        height: 100%;
        padding: 0.4em 1.2em;
    }
</style>

{#if layout instanceof PanelGroup}
    <Splitpanes
        class="default-theme"
        {horizontal}
        style={height=="" ? "" : "height: {height}"}
    >
    {#each layout.panels as panel, i}
        <Pane {minSize}>
            <!-- Subpanels alternate horiz/vert -->
            {#if panel instanceof PanelLeaf}
                <!-- {i} -->
                <PanelBlip on:blipDragged={e => handleBlipDrag(e, i)}/>
            {/if}
            <svelte:self layout={panel} horizontal={!horizontal} height="100px" />
        </Pane>
    {/each}
    </Splitpanes>

{:else if layout instanceof PanelLeaf}
    <!-- Actual panel content goes here -->
    <div class="full">
        {layout.content}
    </div>
{/if}