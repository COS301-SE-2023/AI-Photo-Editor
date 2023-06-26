<!-- A small dropdown list at the top of each panel allowing -->
<!-- the user to change the current tile to something else -->

<script lang="ts">
  let open = false;
  export let type: string;
  export let current: string;

  import Fa from "svelte-fa";
  // import { faFlag } from '@fortawesome/free-solid-svg-icons'
  // import { faGithub } from '@fortawesome/free-brands-svg-icons';
  import {
    faDiagramProject,
    faImage,
    faMagnifyingGlass,
    faTerminal,
    faKeyboard,
  } from "@fortawesome/free-solid-svg-icons";

  // TODO: Clean this up and bundle it with the string -> tile mappings in Panel.svelte
  const tileIcons: { [key: string]: any } = {};
  tileIcons["graph"] = faDiagramProject;
  tileIcons["media"] = faImage;
  tileIcons["inspector"] = faMagnifyingGlass;
  tileIcons["promptBox"] = faTerminal;
  tileIcons["shortcutSettings"] = faKeyboard;
</script>

<div class="tileSel" on:click="{() => (open = !open)}" on:keypress="{null}">
  <div class="icon"><Fa icon="{tileIcons[type]}" /></div>
</div>
{#if open}
  <div class="tileDialog" on:mouseleave="{() => (open = false)}">
    {#each Object.keys(tileIcons) as to}
      <!-- {#each Array(50).fill("Some item") as to} -->
      <div
        class="tileOption"
        on:click="{() => {
          type = to;
          open = false;
        }}"
        on:keydown="{null}"
      >
        <div class="innerTileOption">
          <span class="padRight"><Fa icon="{tileIcons[to]}" /></span>{to}
        </div>
      </div>
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

  .padRight {
    padding-right: 0.4rem;
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

  .innerTileOption {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    align-content: center;
  }
</style>
