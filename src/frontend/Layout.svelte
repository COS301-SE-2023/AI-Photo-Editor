<script lang="ts">
    import Media from './panes/Media.svelte';

    class ScreenLayout {
        constructor(){
            this.l = null;
            this.r = null;
        }
        l: ScreenLayout | null;
        r: ScreenLayout | null;
    }

    import { Pane, Splitpanes } from 'svelte-splitpanes';

    let root: any;

    let layout = new ScreenLayout();
    layout.l = new ScreenLayout();
    layout.r = new ScreenLayout();

    let portrait = true;
    let v = 15;

</script>

{#if portrait}
<Splitpanes class="default-theme" style="height: 100%" horizontal={true}>
	<Pane minSize={v}>Image goes here</Pane>
	<Pane>
        <Media />
    </Pane>
	<Pane minSize={10} size={10}>asdf</Pane>
	<Pane minSize={10} maxSize={10} size={10}>Prompt goes here</Pane>
</Splitpanes>
{/if}

{#if !portrait}

{#key root}
<Splitpanes class="default-theme" style="height: 100%" horizontal={true}>
    {#if layout.l}
        <Pane minSize={v}>Left layout</Pane>
    {/if}
    {#if layout.r}
        <Pane minSize={v}>Right layout</Pane>
    {/if}
</Splitpanes>
{/key}

{/if}