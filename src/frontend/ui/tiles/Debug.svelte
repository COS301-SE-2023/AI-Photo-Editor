<script lang="ts">
  import { graphMall } from "lib/stores/GraphStore";
  import { projectStore } from "lib/stores/ProjectStore";
  import { toolboxStore } from "lib/stores/ToolboxStore";
  import { get } from "svelte/store";

  let graphIds = graphMall.getAllGraphUUIDsReactive();

  const toolboxSignatures = toolboxStore.getAllSignaturesReactive();
  // console.log($toolboxStore);

  // setInterval(() => {
  //   console.log(get($graphMall[$graphIds[0]]));
  // }, 3000);

  // export let graphId = $graphMall.getAllGraphUUIDs()[0]; //TODO: Put this in a selectable dropdown
  // $: thisGraphStore = $graphMall.getGraph(graphId);
</script>

<div class="content">
  <div class="output">
    <b>Toolbox</b>: <br />
    {#each $toolboxSignatures as key}
      {key}: {JSON.stringify({ ...$toolboxStore[key], ui: $toolboxStore[key].ui !== null })}
      <br /><br />
    {/each}

    <hr />
    <b>Graph Mall</b>: <br />
    {JSON.stringify($graphMall)}
    <hr />
    <b>Graph Stores</b>: <br />
    {#each $graphIds as data}
      {data.slice(0, 8)}: {JSON.stringify(get($graphMall[data]))}
      <br /><br />
    {/each}
    <hr />
    <b>Project Store</b>: <br />
    {JSON.stringify($projectStore)}
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

  hr {
    width: 100%;
    border: 1px solid #cdd6f4;
    margin-top: 1em;
    margin-bottom: 1em;
  }
</style>
