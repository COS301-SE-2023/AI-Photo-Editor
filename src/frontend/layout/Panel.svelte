<!-- A recursive splittable box for UI  -->
<script lang="ts">
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import { PanelNode, PanelGroup, PanelLeaf } from "./PanelNode";
    import PanelBlip from "./PanelBlip.svelte";
    const minSize = 10;

    export let horizontal: boolean = false;
    export let layout: PanelNode;
    export let height: string;

    enum dockV { "t", "b" };
    enum dockH { "l", "r" };

    // (Parallel/Perpendicular)_(in/out)
    enum localDir { "pl_i", "pl_o", "pp_i", "pp_o", null }

    // Forwards/Backwards relative to the direction of increasing panel indices
    enum indexDir { "f", "b" }

    // Map blip drag dir to localDir based on tile orientation & blip dock
    function localize(dir: string, dock: [dockV, dockH]): localDir {
        if (horizontal) { // Pane split is horizontal, tiles run vertically
            switch (dir) {
                case "u": return (dock[0]==dockV.t) ? localDir.pl_o : localDir.pl_i;
                case "d": return (dock[0]==dockV.t) ? localDir.pl_i : localDir.pl_o;

                case "l": return (dock[1]==dockH.l) ? localDir.pp_o : localDir.pp_i;
                case "r": return (dock[1]==dockH.l) ? localDir.pp_i : localDir.pp_o;
            }
        }
        else { //Pane split is vertical, tiles run horizontally
            switch (dir) {
                case "u": return (dock[0]==dockV.t) ? localDir.pp_o : localDir.pp_i;
                case "d": return (dock[0]==dockV.t) ? localDir.pp_i : localDir.pp_o;

                case "l": return (dock[1]==dockH.l) ? localDir.pl_o : localDir.pl_i;
                case "r": return (dock[1]==dockH.l) ? localDir.pl_i : localDir.pl_o;
            }
        }
        return localDir.null;
    }

    function handleBlipDrag(e: any, index: number, dock: [dockV, dockH] ) {
        if (!(layout instanceof PanelGroup)) { return; }

        let dir = e.detail.dir;

        // Transform u/d/l/r direction to local direction within PaneGroup
        let slide: localDir = localize(dir, dock);
        console.log(["|| in", "|| out", "_|_ in", "_|_ out"][slide]);

        let iDir: indexDir = horizontal ?
            ( dir == "d" ? indexDir.f : indexDir.b) :
            ( dir == "r" ? indexDir.f : indexDir.b);

        // Perform panel operation
        switch (slide) {
            case localDir.pl_i: // add panel at index
                layout.addPanel("newPanel", index);
                layout = layout; // Force update
                break;

            case localDir.pl_o: // remove panel at index-1 if possible

                // Check which index to remove based on index direction
                let toRem = index + (iDir == indexDir.f ? 1 : -1);
                console.log("REMOVE " + toRem);

                if (toRem >= 0 && toRem < layout.panels.length) {
                    layout.removePanel(toRem);
                    layout = layout;

                    // if we are the last panel in the group, dissolve the group
                    if ((layout as PanelGroup).panels.length == 1) {
                        layout = (layout as PanelGroup).getPanel(0) as PanelLeaf;

                        //TODO: Fix blips disappearing when dissolving the group
                        layout.parent = layout.parent;
                        layout = layout;
                    }
                }
                break;

            case localDir.pp_i: // encapsulate panel within panelgroup, add another panel to group
                    let group = new PanelGroup("new");
                    //TODO: Pass actual panel content instead of just string
                    group.addPanel((layout.panels[index] as PanelLeaf).content, 0);
                    group.addPanel("new2", 1);
                    layout.removePanel(index);
                    layout.addPanelGroup(group, index);

                    layout = layout; // Force update
                break;

            case localDir.pp_o: // invalid

            default: return;
        }
    }
</script>

{#if layout instanceof PanelGroup}
    <div class="bord">
    <Splitpanes
        class="modern-theme"
        {horizontal}
        style={height=="" ? "" : "height: {height}"}
    >
    {#each layout.panels as panel, i}
        <Pane {minSize}>
            <!-- Subpanels alternate horiz/vert -->
            {#if panel instanceof PanelLeaf}
                {i}
                <PanelBlip dock="tl" on:blipDragged={e => handleBlipDrag(e, i, [dockV.t, dockH.l])}/>
                <PanelBlip dock="br" on:blipDragged={e => handleBlipDrag(e, i, [dockV.b, dockH.r])}/>
            {/if}
            <svelte:self layout={panel} horizontal={!horizontal} height="100px" />
        </Pane>
    {/each}
    </Splitpanes>
    </div>

{:else if layout instanceof PanelLeaf}
    <!-- Actual panel content goes here -->
    <div class="full">
        {layout.content}
    </div>
{/if}

<style>
    .full {
        width: 100%;
        height: 100%;
        padding: 0.4em 1.2em;
    }
    .bord {
        border: 3px solid green;
        width: 100%;
        height: 100%;
    }
</style>