<!-- Renders a custom webview defined, for instance, by a plugin -->
<script lang="ts">
  import {
    faAngleLeft,
    faAngleRight,
    faMagnifyingGlass,
    faRotate,
  } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";

  const SEARCH_ENGINE = "https://google.com";
  const SEARCH_QUERY = "/search?q=";

  let webview: Electron.WebviewTag | null = null;

  let urlBar = SEARCH_ENGINE;
  let url = urlBar;

  let history = [urlBar];
  let historyIndex = 0;

  function go() {
    urlBar = urlBar.trim();
    if (urlBar !== "") {
      if (!urlBar.startsWith("http://") && !urlBar.startsWith("https://")) {
        if (urlBar.includes(".") && !(urlBar.includes(" ") || urlBar.includes("\t"))) {
          urlBar = "https://" + urlBar;
        } else {
          urlBar = `${SEARCH_ENGINE}${SEARCH_QUERY}${urlBar
            .split(/\s+/)
            .map((x) => encodeURIComponent(x))
            .join("+")}`;
        }
      }

      if (urlBar !== history[historyIndex]) {
        history = history.slice(0, historyIndex + 1);
        history.push(urlBar);
        historyIndex++;
        reload();
      }
    }
  }

  $: canGoBack = historyIndex > 0;
  $: canGoForward = historyIndex < history.length - 1;

  function back() {
    if (canGoBack) {
      urlBar = history[--historyIndex];
      reload();
    }
  }
  function forward() {
    if (canGoForward) {
      urlBar = history[++historyIndex];
      reload();
    }
  }

  async function reload() {
    url = urlBar;
    webview?.loadURL(url);
  }

  function addWebviewListeners() {
    // webview?.addEventListener("did-start-loading", () => { console.log("Loading"); });
    // webview?.addEventListener("did-stop-loading", () => { console.log("Done loading"); });
    webview?.addEventListener("will-navigate", (e) => {
      e.stopPropagation();
      console.log("Navigating", e);

      urlBar = e.url;
      go();
    });
  }

  onMount(() => {
    addWebviewListeners();
  });
</script>

<div class="content">
  <div class="bar">
    <button class="back {canGoBack ? '' : 'disabled'}" on:click="{back}"
      ><Fa icon="{faAngleLeft}" /></button
    >
    <button class="forward {canGoForward ? '' : 'disabled'}" on:click="{forward}"
      ><Fa icon="{faAngleRight}" /></button
    >
    <button class="reload" on:click="{reload}"><Fa icon="{faRotate}" /></button>

    <input
      type="text"
      bind:value="{urlBar}"
      on:keydown="{(e) => {
        e.key === 'Enter' && go();
      }}"
    />
    <button class="search" on:click="{go}"><Fa icon="{faMagnifyingGlass}" /></button>
  </div>
  <div class="webContent">
    {#if url !== ""}
      <webview bind:this="{webview}" src="{url}"></webview>
    {:else}
      <div class="message">Enter a URL</div>
    {/if}
  </div>
</div>

<style>
  .content {
    display: grid;
    grid-template-rows: 2em auto;
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow: none;
  }

  webview {
    width: 100%;
    height: 100%;
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #11111b;
  }

  .bar > input {
    color: white;
    border: none;
    margin-left: 1em;
    background-color: #1e1e2e;
    padding-left: 0.8em;
    width: 60%;
    outline: none;
    border-radius: 1em 0px 0px 1em;
  }

  .bar > button {
    color: white;
    border: none;
    background-color: #1e1e2e;
    padding: 0.25em;
  }

  .bar > .back {
    width: 2em;
    text-align: center;
    padding-left: 0.7em;
    border-radius: 1em 0px 0px 1em;
  }
  .bar > .forward {
    width: 2em;
    text-align: center;
    padding-left: 0.6em;
    border-radius: 0px 1em 1em 0px;
  }
  .bar > .reload {
    width: 2em;
    text-align: center;
    border-radius: 1em 1em 1em 1em;
    padding-left: 0.5em;
    margin-left: 1em;
  }

  .bar > .search {
    width: 2em;
    padding-left: 0.4em;
    border-radius: 0px 1em 1em 0px;
  }

  .bar > button:hover {
    background-color: #2c2c41;
  }

  .bar > .disabled {
    pointer-events: none;
    cursor: default;
  }

  .bar > .disabled:hover {
    background-color: inherit;
  }

  .webContent {
    overscroll-behavior: contain;
  }

  .webContent > .message {
    width: 100%;
    height: 100%;
    color: white;
    text-align: center;
  }
</style>
