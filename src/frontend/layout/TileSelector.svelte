<!-- A small dropdown list at the top of each panel allowing -->
<!-- the user to change the current tile to something else -->

<script lang="ts">
  let open = false;

  let tileOptions = ["Graph", "Media", "Inspector", "PromptBox"];
</script>

<div class="tileSel" on:click="{() => (open = !open)}" on:keypress="{null}">
  <div class="icon"></div>
</div>
{#if open}
  <div class="tileDialog" on:mouseleave="{() => (open = false)}">
    {#each tileOptions as to}
      <!-- {#each Array(50).fill("Some item") as to} -->
      <div class="tileOption">{to}</div>
    {/each}
  </div>
{/if}

<style>
  .tileSel {
    position: absolute;
    top: 0px;
    left: 0.8rem;
    width: 1.6rem;
    height: 1rem;
    z-index: 9999;

    padding: 0px;
    padding-top: 0.1rem;
    border-radius: 0px 0px 0.4rem 0.4rem;
    background-color: #11111b;
    overflow: hidden;

    font-size: 0.6em;
    text-align: center;

    cursor: pointer;
  }

  .tileSel:hover {
    background-color: #0c0c13;
  }

  .icon {
    text-align: center;
    display: inline-block;
    width: fit-content;
  }

  .tileDialog {
    position: absolute;
    display: flex;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    z-index: 9998;

    background-color: #181825;
    font-size: 0.8em;
    padding: 1.2rem;
    overflow-x: hidden;

    flex-direction: column;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: stretch;
    align-content: stretch;
  }

  .tileDialog div {
    background-color: #11111b;
    padding: 0.1rem 0.4rem;
    margin: 0.2rem;
    overflow: hidden;
  }

  .tileDialog div:hover {
    background-color: #0c0c13;
  }

  .tileOption {
    cursor: pointer;
  }
</style>
