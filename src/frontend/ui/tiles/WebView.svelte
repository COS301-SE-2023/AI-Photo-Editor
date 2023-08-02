<!-- Renders a custom webview defined, for instance, by a plugin -->
<script lang="ts">
  let webview = null;

  // const loadstart = () => {
  //   indicator.innerText = 'loading...'
  // }

  // const loadstop = () => {
  //   indicator.innerText = ''
  // }

  if (webview) {
    // webview.addEventListener('did-start-loading', loadstart)
    // webview.addEventListener('did-stop-loading', loadstop)
  }
</script>

<div class="content">
  <webview bind:this="{webview}" src="https://youtu.be/dQw4w9WgXcQ"> </webview>
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
</style>
