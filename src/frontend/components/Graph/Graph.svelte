<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script>
  import { Svelvet, ThemeToggle, Node, Background } from "svelvet";
  import Brightness from "./Brightness.svelte";
</script>

<Svelvet id="my-canvas" zoom="{1}" minimap theme="custom-dark">
  <Node bgColor="#ec4899" height="{200}" position="{{ x: 600, y: 600 }}" />
  <Brightness />
  <!-- <ThemeToggle main="dark" alt="light" slot="toggle" /> -->
</Svelvet>

<style>
  :root[svelvet-theme="custom-dark"] {
    /* --background-color: #181825; */
    --background-color: theme(colors.ctp-base);
    --dot-color: hsl(225, 10%, 50%);

    --minimap-background-color: theme(colors.ctp-mantle);

    --minimap-node-color: hsl(225, 30%, 20%);

    --controls-background-color: hsl(225, 20%, 27%);
    --controls-text-color: hsl(0, 0%, 100%);

    --theme-toggle-text-color: hsl(0, 0%, 100%);
    --theme-toggle-color: hsl(225, 20%, 27%);

    --node-color: hsl(74, 61%, 69%); 
  }
</style>
