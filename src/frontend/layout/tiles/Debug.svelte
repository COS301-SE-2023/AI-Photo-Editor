<script lang="ts">
  import { graphMall } from "stores/GraphStore";
  import { projectStore } from "stores/ProjectStore";

  export let graphId = $graphMall.getAllGraphUUIDs()[0]; //TODO: Put this in a selectable dropdown
  $: thisGraphStore = $graphMall.getGraph(graphId);
</script>

<div class="content">
  <div class="output">
    <b>Graph Mall</b>: <br />
    {JSON.stringify($graphMall)}
    <hr />
    <b>Graph Store</b>: <br />
    {JSON.stringify($thisGraphStore)}
    <hr />
    <b>Project Store</b>: <br />
    {JSON.stringify($projectStore)}
  </div>
</div>

<style>
  .content {
    display: table;
    width: 100%;
    height: 100%;
    padding: 2em;
    word-wrap: break-word;
  }

  .output {
    font-family: monospace;
    font-size: 0.8em;
    display: table-cell;
    vertical-align: center;

    padding: 2em;
    overflow-y: scroll;
    overflow-wrap: break-word;
    background-color: #11111b;
    border-radius: 0.4em;
  }

  hr {
    width: 100%;
    border: 1px solid #cdd6f4;
    margin-top: 1em;
    margin-bottom: 1em;
  }
</style>
