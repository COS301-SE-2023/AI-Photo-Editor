<script lang="ts">
    import Panel from './Panel.svelte';
    import { PanelGroup } from './PanelNode';

    let subLayout = new PanelGroup("2");
    subLayout.addPanel("qwer");
    subLayout.addPanel("rewq");

    let layout = new PanelGroup("1");
    layout.addPanel("asdf");
    layout.addPanelGroup(subLayout);
    layout.addPanel("fdsa");

</script>

<Panel {layout} horizontal={true} height="100%"/>