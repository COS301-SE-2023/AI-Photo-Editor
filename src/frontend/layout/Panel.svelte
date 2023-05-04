<!-- A recursive splittable box for UI  -->
<script lang="ts">
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import { PanelNode, PanelGroup, PanelLeaf } from "./PanelNode";
    import PanelBlip from "./PanelBlip.svelte";
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

{#if layout instanceof PanelGroup}

    <!-- <span><button on:click={addPanel}>+</button></span>
    <span><button on:click={removePanel}>&MediumSpace;-&MediumSpace;</button></span>
    <span><button on:click={addPanelGroup}>+g</button></span>
    <span>{layout.name}</span> -->
    <Splitpanes
        class="default-theme"
        {horizontal}
        style={height=="" ? "" : "height: {height}"}
    >
    {#each layout.panels as panel, i}
        <Pane {minSize}>
            <!-- Subpanels alternate horiz/vert -->
            {#if panel instanceof PanelLeaf}
                {i}
                <PanelBlip on:click={addPanel}/>
                <!-- <button on:click={addPanel}>+</button> -->
                <button on:click={removePanel}>&MediumSpace;-&MediumSpace;</button>
                <button on:click={addPanelGroup}>+g</button>
            {/if}
            <svelte:self layout={panel} horizontal={!horizontal} height="100px" />
        </Pane>
    {/each}
    </Splitpanes>

{:else if layout instanceof PanelLeaf}
    <!-- Actual pane content goes here -->
    <div class="full">
        {layout.content}
    </div>
{/if}