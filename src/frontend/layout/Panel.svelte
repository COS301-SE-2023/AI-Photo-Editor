<!-- A recursive splittable box for UI  -->
<script lang="ts">
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import { PanelNode, PanelGroup, PanelLeaf } from "./PanelNode";
    const minSize = 10;

    export let horizontal: boolean = false;
    export let layout: PanelNode;
    export let height: string;

    // Split the current pane into two
    function addPanel() {
        if (layout instanceof PanelGroup) {
            layout.addPanel(Math.random().toString());
            layout = layout; // Force update
        }
        else if (layout instanceof PanelLeaf) {
            layout.parent.addPanel(Math.random().toString());
            layout.parent = layout.parent; // Force update
        }
    }
    function removePanel() {
        if (layout instanceof PanelGroup) {
            layout.removePanel(1);
            layout = layout; // Force update
        }
        else if (layout instanceof PanelLeaf) {
            layout.parent.removePanel(0);
            layout.parent = layout.parent; // Force update
        }
    }
    function addPanelGroup() {
        if (layout instanceof PanelGroup) {
            layout.addPanelGroup(new PanelGroup("new"));
            layout = layout; // Force update
        }
        else if (layout instanceof PanelLeaf) {
            layout.parent.addPanelGroup(new PanelGroup("new"));
            layout.parent = layout.parent; // Force update
        }
    }
</script>

<style>
</style>

{#if layout instanceof PanelGroup}

    <span><button on:click={addPanel}>+</button></span>
    <span><button on:click={removePanel}>&MediumSpace;-&MediumSpace;</button></span>
    <span><button on:click={addPanelGroup}>+g</button></span>
    <span>{layout.name}</span>
    <Splitpanes
        class="default-theme"
        {horizontal}
        style={height=="" ? "" : "height: {height}"}
    >
    {#each layout.panels as panel}
        <Pane {minSize}>
            <!-- Subpanels alternate horiz/vert -->
            <svelte:self layout={panel} horizontal={!horizontal} height="100px" />
        </Pane>
    {/each}
    </Splitpanes>

{:else if layout instanceof PanelLeaf}
    <!-- Actual pane content goes here -->
    <div class="full">
        <!-- <button on:click={split}>Split</button> -->
        {layout.content}
    </div>
{/if}