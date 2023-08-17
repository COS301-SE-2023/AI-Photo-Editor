<!-- Renders a custom webview defined, for instance, by a plugin -->
<script lang="ts">
  import { onMount } from "svelte";

  let webview: Electron.WebviewTag | null = null;

  let src = "file:///home/rec1dite/code/301/capstone/blix-plugins/pixi-plugin/src/index.html";

  export let media: unknown;

  $: updateMedia(media);

  function updateMedia(media: unknown) {
    // To manually execute a javascript function within the webview:
    // const res = await webview?.executeJavaScript("app.dispatchMessage('hi there!')");

    // To send a message to the webview over IPC, use the webview's send method:
    webview?.send("mediaChanged", media);
  }

  function reload() {
    webview?.reload();
  }
  function openDevTools() {
    webview?.openDevTools();
  }

  onMount(() => {
    setInterval(async () => {}, 10);

    // To receive a message from the webview, add an event listener for the ipc-message event:
    webview?.addEventListener("ipc-message", (event) => {
      console.log("Message received from webview:", event.channel, event);
    });
  });

  if (webview) {
    // webview.addEventListener('did-start-loading', loadstart)
    // webview.addEventListener('did-stop-loading', loadstop)
  }
</script>

<div class="content">
  <div class="hover flex items-center space-x-2">
    <button on:click="{reload}">Reload</button>
    <button on:click="{openDevTools}">DevTools</button>
  </div>

  <!-- Preload is set in "will-attach-webview" in index.ts -->
  <!-- See: src/electron/lib/webviews/preload.ts -->
  <webview
    bind:this="{webview}"
    src="{src}"
    nodeintegration="{false}"
    webpreferences="contextIsolation=true"></webview>
</div>

<style>
  .content {
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow: none;
  }

  webview {
    width: 100%;
    height: 100%;
  }

  .hover {
    position: absolute;
    bottom: 1em;
    left: 1em;
    color: black;
    z-index: 100;
  }

  .hover button {
    background-color: white;
  }
</style>
