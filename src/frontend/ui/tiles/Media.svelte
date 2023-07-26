<!-- This pane is for showing media content large-scale -->
<script lang="ts">
  import Image from "../../ui/utils/Image.svelte";

  let options = ["None selected"];
  let showSoHot = false;
</script>

<div class="fullPane">
  <div class="hover">
    <select value="{options[0]}">
      {#each options as option}
        <option value="{option}">
          {option}
        </option>
      {/each}
    </select>
  </div>

  <div class="media">
    {#if !showSoHot}
      <div
        class="placeholder"
        on:click="{() => {
          showSoHot = true;
          options = ['svelteSoHot'];
        }}"
        on:keydown="{null}"
      >
        Select Image
      </div>
    {:else}
      <div
        on:click="{() => {
          showSoHot = false;
          options = ['None Selected'];
        }}"
        on:keydown="{null}"
      >
        <Image src="https://media.tenor.com/1wZ88hrB5SwAAAAd/subway-surfer.gif" />
      </div>
    {/if}
  </div>
  <button on:click="{compute}">Testing</button>
</div>

<style>
  /* Scale the pane to full available space */
  .fullPane {
    margin: 0px;
    width: 100%;
    height: 100%;
  }

  .media {
    width: calc(100%-2em);
    margin: auto;
    height: auto;
    text-align: center;
  }

  .hover {
    position: absolute;
    bottom: 1em;
    left: 1em;
    color: black;
  }

  .placeholder {
    padding-top: 140px;
    text-align: center;
    display: inline-block;
    width: 300px;
    height: 300px;
    border: 2px solid grey;
    border-radius: 0.4em;
    margin-top: 1em;
  }
  .placeholder:hover {
    background-color: #1e1e2e;
    cursor: pointer;
  }
</style>
