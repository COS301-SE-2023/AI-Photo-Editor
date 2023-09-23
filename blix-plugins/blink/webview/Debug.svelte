<script lang="ts">
  import { text } from "svelte/internal";

  export let data: any;
</script>

<!-- BlinkCanvas -->
{#if data != null}
  <span>
    {#if data["assets"]}
      <br />
      {#each Object.keys(data.assets) as assetId}
        {#if data.assets[assetId].type === "image"}
          <img src="{data.assets[assetId].data}" width="20px" alt="" />
        {/if}
      {/each}
      <br />

      <svelte:self data="{data.content}" />
      <!-- Clump -->
    {:else if data["class"] === "clump"}
      <span style="color: teal">CLUMP</span> [{Math.round(data.transform.position.x)}, {Math.round(
        data.transform.position.y
      )}] <span style="color: blue">
      {#if data?.filters}
        &lt;{#each data.filters as filter}{filter.type}{/each}&gt;
      {/if}
      </span>
      <ul>
        {#each data.elements as element}
          <li><svelte:self data="{element}" /></li>
        {/each}
      </ul>
      <br />
      <!-- Atom -->
    {:else if data["class"] === "atom"}
      <span style="color: cyan">ATOM</span> {data["type"]}: {#if data["type"] === "image"}
        image({data.src})
      {:else if data["type"] === "shape"}
        shape(<span style="color: #{data.fill.toString(16).padStart(6, '0')};">{data.shape}</span>, {JSON.stringify(
          data.bounds
        )})
      {:else if data["type"] === "text"}
        text({data.text})
      {:else if data["type"] === "paint"}
        paint({data.uuid})
      {:else if data["type"] === "blob"}
        blob()
      {/if}
    {/if}
  </span>
{/if}

<style>
  span {
    font-size: 0.6rem;
  }
  ul {
    margin: 0px;
  }
  li {
    margin: 0px;
    padding: 0px;
  }
</style>
