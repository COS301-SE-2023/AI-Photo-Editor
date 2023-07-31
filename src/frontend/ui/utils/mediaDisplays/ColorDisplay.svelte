<script lang="ts">
  import type { CSSColorString } from "blix_svelvet";

  export let color: CSSColorString = "black";
</script>

<div class="content">
  <div class="output" style:background-color="{color}">
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
