<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  :global(.splitpanes__pane) {
  box-shadow: 0 0 3px rgba(0, 0, 0, .2) inset;
  justify-content: center;
  align-items: center;
  display: flex;
  position: relative;
}

</style>

<script lang="ts">
  import { Pane, Splitpanes } from 'svelte-splitpanes';

  let v = 10

</script>

<Splitpanes class="default-theme" style="height: 400px">
	<Pane minSize={v}>I have a min width of 20%</Pane>

	<Pane>

		<Splitpanes class="default-theme" horizontal="{true}">

			<Pane minSize={15}>I have a min height of 15%</Pane>
			<Pane>Try double clicking the splitters</Pane>
			<Pane snapSize={10}>With a bottom snap of 10</Pane>

		</Splitpanes>

	</Pane>

	<Pane>Right Panel</Pane>

</Splitpanes>
