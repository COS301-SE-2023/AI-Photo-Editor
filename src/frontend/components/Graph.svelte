<script>
	import { Node, Svelvet, Minimap, Controls } from 'svelvet';
</script>
  
<Svelvet id="my-canvas" width="{500}" height="{500}" TD minimap locked>
	<Node />
	<Node id="alpha" bgColor="red" label="Default Node" />
	<Controls />
</Svelvet>