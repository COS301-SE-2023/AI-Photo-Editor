<script lang="ts">
    import Panel from './Panel.svelte';
    import { PanelGroup } from './PanelNode';

    let subLayout = new PanelGroup("2");
    subLayout.addPanel("qwer", 0);
    subLayout.addPanel("rewq", 0);

    let layout = new PanelGroup("1");
    layout.addPanel("asdf", 0);
    layout.addPanelGroup(subLayout);
    layout.addPanel("fdsa", 0);

</script>

<Panel {layout} horizontal={true} height="100%"/>