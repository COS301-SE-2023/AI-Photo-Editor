<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script>
  import { Svelvet, ThemeToggle, Node, Background } from "svelvet";
</script>

<Svelvet id="my-canvas" zoom="{0.5}" minimap theme="custom-dark">
  <Node bgColor="#ec4899" height="{200}" position="{{ x: 100, y: 100 }}" />
</Svelvet>

<style>
  :root[svelvet-theme="custom-dark"] {
    --background-color: #181825;
    --dot-color: hsl(225, 10%, 50%);

    --minimap-background-color: #52525b;

    --minimap-node-color: hsl(225, 30%, 20%);

    --controls-background-color: hsl(225, 20%, 27%);
    --controls-text-color: hsl(0, 0%, 100%);

    --theme-toggle-text-color: hsl(0, 0%, 100%);
    --theme-toggle-color: hsl(225, 20%, 27%);
  }
</style>
