<script>
	import { Svelvet, ThemeToggle, Node, Background } from "svelvet";
</script>
  
<Svelvet id="my-canvas" width={1100} height={600} zoom={0.5} minimap theme="custom-theme">
	<Node bgColor="#ec4899" height={200} position={{ x: 100, y: 100 }} />
	<ThemeToggle main="dark" alt="light" slot="toggle"/>
	<Background dotColor="grey" bgColor="#27272a" gridWidth={40} dotSize={2} slot="background" />
</Svelvet> 