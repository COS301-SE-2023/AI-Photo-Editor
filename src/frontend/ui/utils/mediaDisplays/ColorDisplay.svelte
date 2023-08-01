<script lang="ts">
  import type { CSSColorString } from "blix_svelvet";

  export let color: CSSColorString = "black";

  // hsl(301.9, 68.9%, 65.55%)
  // 45 < h < 190 -> black
  // 85 < l -> black
  function getFontColor(color: CSSColorString): string {
    if (color.startsWith("hsl")) {
      const [h, _, l] = color
        .split("(")[1]
        .split(")")[0]
        .split(",")
        .map((v) => parseFloat(v));
      return (45 < h && h < 190) || l > 85 ? "black" : "white";
    }
    return "white";
  }
</script>

<div class="content">
  <div class="output" style="background-color: {color}; color: {getFontColor(color)}">
    {color}
  </div>
</div>

<style>
  .content {
    width: 100%;
    height: 100%;
    max-height: 100%;
    padding: 2em;
  }

  .output {
    font-family: monospace;
    font-size: 0.8em;
    vertical-align: center;
    max-height: 100%;
    overflow-y: auto;

    padding: 2em;
    word-break: break-all;
    border-radius: 0.4em;
    color: white;
  }

  .normal {
    color: white;
    background-color: #11111b;
    border: none;
  }

  .error {
    color: red;
    background-color: #530706;
    border: 2px solid #6b0000;
  }

  .warning {
    color: #ffc06e;
    background-color: #775000;
    border: 2px solid #623900;
  }
</style>
