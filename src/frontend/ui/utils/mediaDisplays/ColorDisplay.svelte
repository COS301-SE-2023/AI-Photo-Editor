<script lang="ts">
  import type { CSSColorString } from "blix_svelvet";
  import { colord } from "colord";

  export let color: CSSColorString = "black";

  // hsl(301.9, 68.9%, 65.55%)
  // 45 < h < 190 -> black
  // 85 < l -> black
  function getColor(rgba: string) {
    return colord(rgba).toRgbString();
  }

  function getFontColor(rgba: string) {
    const col = colord(rgba);
    return col.brightness() > 0.5 || col.alpha() < 0.3 ? "black" : "white";
  }
</script>

<div class="content">
  <div class="output">
    <div class="color" style="background-color: {getColor(color)}; color: {getFontColor(color)}">
      {color}
    </div>
    <div class="color checker"></div>
  </div>
</div>

<style>
  .content {
    position: relative;
    width: 100%;
    height: 100%;
    max-height: 100%;
    padding: 2em;
  }

  .output {
    position: relative;
    height: 4em;
    color: white;
  }

  .color {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;

    padding: 1.3em;
    font-family: monospace;
    font-size: 1.2em;
    vertical-align: center;
    word-break: break-all;
    overflow-y: auto;

    border-radius: 0.4em;
  }

  .checker {
    z-index: 0;

    background-image: linear-gradient(45deg, #ffffff 25%, transparent 25%),
      linear-gradient(-45deg, #ffffff 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ffffff 75%),
      linear-gradient(-45deg, transparent 75%, #ffffff 75%);

    background-color: lightgray;

    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-size: 20px 20px;
  }
</style>
