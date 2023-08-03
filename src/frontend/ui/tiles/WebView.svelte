<!-- Renders a custom webview defined, for instance, by a plugin -->
<script lang="ts">
  let webview: Electron.WebviewTag | null = null;

  let src = "file:///home/rec1dite/code/301/capstone/blix-plugins/glfx-plugin/src/index.html";

  // const loadstart = () => {
  //   indicator.innerText = 'loading...'
  // }

  // const loadstop = () => {
  //   indicator.innerText = ''
  // }

  function reload() {
    webview?.reload();
  }

  if (webview) {
    // webview.addEventListener('did-start-loading', loadstart)
    // webview.addEventListener('did-stop-loading', loadstop)
  }
</script>

<div class="content">
  <div class="hover flex items-center space-x-2">
    <button on:click="{reload}">Reload</button>
  </div>

  <webview bind:this="{webview}" src="{src}"> </webview>
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
    background-color: white;
    position: absolute;
    bottom: 1em;
    left: 1em;
    color: black;
    z-index: 100;
  }
</style>
