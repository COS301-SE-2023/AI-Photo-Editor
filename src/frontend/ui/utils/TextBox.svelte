<script lang="ts">
  export let content = "";
</script>

<div class="content">
  <div class="output">
    {content}
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
    background-color: #11111b;
    border-radius: 0.4em;
  }
</style>
