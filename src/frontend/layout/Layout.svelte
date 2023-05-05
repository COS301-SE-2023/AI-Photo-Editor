<script lang="ts">
    import Panel from './Panel.svelte';
    import { PanelGroup } from './PanelNode';

    let subLayout = new PanelGroup("2");
    subLayout.addPanel("qwer", 0);
    subLayout.addPanel("rewq", 0);

    let layout = new PanelGroup("1");
    layout.addPanel("asdf", 0);
    layout.addPanelGroup(subLayout, 1);
    layout.addPanel("fdsa", 2);
    layout.recurseParent();
</script>

<table style="height: 100%; width: 100%">
<tr>
<td>
<button on:click={() => console.log(layout.print())}>Print</button>
<button on:click={() => layout=layout}>Reset</button>
<Panel {layout} horizontal={true} height="100%"/>
</td>
<td style="width: 30%">
    <textarea style="height: 100%; font-family: monospace">{layout.print()}</textarea>
</td>
</tr>
</table>