<!-- A small dropdown list at the top of each panel allowing -->
<!-- the user to change the current tile to something else -->

<script lang="ts">
  let open = false;
  export let type: string;

  import Fa from "svelte-fa";
  import { get } from "svelte/store";
  // import { faFlag } from '@fortawesome/free-solid-svg-icons'
  // import { faGithub } from '@fortawesome/free-brands-svg-icons';
  import {
    faDiagramProject,
    faImage,
    faMagnifyingGlass,
    faTerminal,
    faKeyboard,
    faCode,
    faPuzzlePiece,
    faGlobe,
    faCamera,
    faBrush,
  } from "@fortawesome/free-solid-svg-icons";

  import { tileStore } from "../../../lib/stores/TileStore";

  const tiles = get(tileStore);

  type blixTile = {
    displayName: string;
    description: string | null;
    icon: any;
  };

  // TODO: Clean this up and bundle it with the string -> tile mappings in Panel.svelte
  const tileDict: { [key: string]: blixTile } = {};
  tileDict["graph"] = { displayName: "graph", description: null, icon: faDiagramProject };
  tileDict["media"] = { displayName: "media", description: null, icon: faImage };
  tileDict["webcamera"] = { displayName: "camera", description: null, icon: faCamera };
  // tileDict["inspector"] = { displayName: "inspector", description: null, icon: faMagnifyingGlass };
  tileDict["webview"] = { displayName: "webview", description: null, icon: faPuzzlePiece };
  tileDict["browser"] = { displayName: "browser", description: null, icon: faGlobe };
  // tileDict["promptBox"] = { displayName: "promptBox", description: null, icon: faTerminal };
  // tileDict["shortcutSettings"] = {
  //   displayName: "shortcutSettings",
  //   description: null,
  //   icon: faKeyboard,
  // };
  tileDict["debug"] = { displayName: "debug", description: null, icon: faCode };
  tileDict["assets"] = { displayName: "assets", description: null, icon: faBrush };

  for (const tile in tiles) {
    tileDict[tiles[tile].signature] = {
      displayName: tiles[tile].displayName,
      description: tiles[tile].description,
      icon: tiles[tile].icon,
    };
    console.log("Icon", tiles[tile].icon);
  }

  function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
</script>

<div
  class="tileSel flex h-4 w-max items-center justify-center px-2"
  on:click="{() => (open = !open)}"
  on:keypress="{null}"
>
  <div class="icon"><Fa icon="{tileDict[type].icon}" /></div>
  <!-- <span class="pl-1">{toTitleCase( tileDict[type].displayName)}</span> -->
</div>
{#if open}
  <div class="tileDialog" on:mouseleave="{() => (open = false)}">
    {#each Object.keys(tileDict) as to}
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
          <span class="padRight"><Fa icon="{tileDict[to].icon}" /></span>{toTitleCase(
            tileDict[to].displayName
          )}
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
    /* height: 1.3rem; */
    z-index: 40;

    /* padding: 0px;
    padding-top: 0.1rem; */
    border-radius: 0px 0px 0.4rem 0.4rem;
    background-color: #11111b;
    overflow: hidden;

    font-size: 0.7em;
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
    border-radius: 7px;
  }

  .innerTileOption {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    align-content: center;
  }
</style>
