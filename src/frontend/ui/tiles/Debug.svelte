<script lang="ts">
  import { graphMall } from "lib/stores/GraphStore";
  import { projectStore } from "lib/stores/ProjectStore";
  import { get } from "svelte/store";

  let graphIds = graphMall.getAllGraphUUIDsReactive();

  // setInterval(() => {
  //   console.log(get($graphMall[$graphIds[0]]));
  // }, 3000);

  // export let graphId = $graphMall.getAllGraphUUIDs()[0]; //TODO: Put this in a selectable dropdown
  // $: thisGraphStore = $graphMall.getGraph(graphId);
</script>

<div class="content">
  <div class="output">
    <b>Graph Mall</b>: <br />
    {JSON.stringify($graphMall)}
    <hr />
    <b>Graph Stores</b>: <br />
    {#each $graphIds as data}
      {data.slice(0, 8)}: {JSON.stringify(get($graphMall[data]))}
      <br />
    {/each}
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
