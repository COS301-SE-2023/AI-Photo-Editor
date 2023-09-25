<!-- Renders a custom webview defined, for instance, by a plugin -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import TextBox from "../../ui/utils/mediaDisplays/TextBox.svelte";
  import { type RendererId } from "../../../shared/types/typeclass";
  import type { TweakApi } from "../../lib/webview/TweakApi";

  let webview: Electron.WebviewTag | null = null;

  export let tweakApi: TweakApi;
  export let renderer: RendererId = "/";
  export function exportMedia(event: Event) {
    webview?.send("export");
  }

  $: asyncSrc = window.apis.typeclassApi.getRendererSrc(renderer);

  $: webviewUpdated(webview);

  let webviewReady = false;
  let dispatch = createEventDispatcher();

  // Called when the webview is created/recreated
  function webviewUpdated(webview: Electron.WebviewTag | null) {
    if (!webview) return;

    // To receive a message from the webview, add an event listener for the ipc-message event:
    webview?.addEventListener("ipc-message", (event) => {
      switch (event.channel) {
        case "tweak":
          const data = event.args[0];
          if (typeof data?.inputs === "object") {
            Object.keys(data.inputs).forEach((input) => {
              tweakApi.setUIInput(data.nodeUUID, input, data.inputs[input]);
            });
          }
          break;
        case "exportResponse":
          dispatch("exportResponse", event.args);
          break;
      }
    });
  }

  export let media: unknown;

  $: updateMedia(media);

  function updateMedia(media: unknown) {
    if (!webviewReady) return;
    // To manually execute a javascript function within the webview:
    // const res = await webview?.executeJavaScript("app.dispatchMessage('hi there!')");

    // To send a message to the webview over IPC, use the webview's send method:
    webview?.send("mediaChanged", media);
  }

  // Initialize media when the webview is ready
  $: initWebviewMedia(webview);

  function initWebviewMedia(webview: Electron.WebviewTag | null) {
    webviewReady = false;
    if (!webview) return;

    // console.log("WEBVIEW");
    webview.addEventListener("dom-ready", () => {
      webviewReady = true;
      updateMedia(media);
    });

    // Force focus the webview when the mouse is over it.
    // This is necessary to prevent the user having to
    // click into it every time before it can receive input
    webview.addEventListener("mouseover", () => {
      webview.focus();
    });
  }

  function reload() {
    webview?.reload();
  }
  function openDevTools() {
    webview?.openDevTools();
  }
</script>

<div class="content">
  {#await asyncSrc then src}
    {#if src !== null}
      <!-- <div class="hover flex items-center space-x-2">
        <button on:click="{reload}">Reload</button>
        <button on:click="{openDevTools}">DevTools</button>
      </div> -->

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
