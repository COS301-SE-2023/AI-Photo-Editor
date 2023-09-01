<!-- Renders a custom webview defined, for instance, by a plugin -->
<script lang="ts">
  import TextBox from "../../ui/utils/mediaDisplays/TextBox.svelte";
  import { type RendererId } from "../../../shared/types/typeclass";
  import { onMount } from "svelte";

  let webview: Electron.WebviewTag | null = null;

  export let renderer: RendererId = "/";

  // $: src = "file:///home/rec1dite/code/301/capstone/blix-plugins/pixi-plugin/src/index.html";
  $: asyncSrc = window.apis.typeclassApi.getRendererSrc(renderer);

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
    // To receive a message from the webview, add an event listener for the ipc-message event:
    webview?.addEventListener("ipc-message", (event) => {
      console.log("Message received from webview:", event.channel, event);
    });

    // TODO: Update webview media directly after load
    // $: if (webview) {
    //   webview.addEventListener("dom-ready", () => {
    //     webview?.send("mediaChanged", media);
    //   });
    // }
  });

  if (webview) {
    // webview.addEventListener('did-start-loading', loadstart)
    // webview.addEventListener('did-stop-loading', loadstop)
  }
</script>

<div class="content">
  {#await asyncSrc then src}
    {#if src !== null}
      <div class="hover flex items-center space-x-2">
        <button on:click="{reload}">Reload</button>
        <button on:click="{openDevTools}">DevTools</button>
      </div>

      <!-- Preload is set in "will-attach-webview" in index.ts -->
      <!-- See: src/electron/lib/webviews/preload.ts -->
      <webview
        bind:this="{webview}"
        src="file://{src}"
        nodeintegration="{false}"
        webpreferences="contextIsolation=true"></webview>
    {:else}
      <TextBox content="Invalid renderer specified in typeclass" status="error" />
    {/if}
  {:catch}
    <TextBox content="Failed to obtain webview src" status="error" />
  {/await}
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
    right: 1em;
    color: black;
    z-index: 100;
  }

  .hover button {
    background-color: white;
  }
</style>
