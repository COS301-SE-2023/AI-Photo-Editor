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

<Panel {layout} horizontal={true} height="calc(100% - 1.5em)"/>

<!-- 
<Splitpanes class="default-theme" style="height: calc(100% - 1.5em)" horizontal={true}>
{#if portrait}
	<Pane minSize={v}>Image goes here</Pane>
	<Pane>
        <Media />
    </Pane>
	<Pane minSize={10} size={10}>asdf</Pane>
	<Pane minSize={10} maxSize={10} size={10}>Prompt goes here</Pane>

{:else}

    {#if layout.l}
        <Pane minSize={v}>Left layout</Pane>
    {/if}
    {#if layout.r}
        <Pane minSize={v}>Right layout</Pane>
    {/if}
{/if}
</Splitpanes> -->