<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<div class="darkenBackground" on:click="{() => dispatch('click')}" on:keydown="{null}"></div>
<div class="splash">
  <div class="grid-container">
    <div class="banner">
      <img src="images/banner_rotated.jpg" alt="Banner" />
    </div>
    <div class="content">
      <img src="images/blix.svg" alt="Banner" class="inline-block w-20" />
      <span class="float-right pt-6 opacity-90">AI Photo Editor</span><br />
      <hr class="my-3 border-gray-400" />
      <br /><br />
      <h2>Recent projects</h2>
      <hr class="my-3 border-gray-600" />
      <i>No recent projects</i>
      <br /><br /><br /><br />
      <h2>Templates</h2>
      <hr class="my-3 border-gray-600" />
      <i>No templates available</i>
    </div>
  </div>
</div>

<style>
  .darkenBackground {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: black;
    opacity: 0.3;
    z-index: 1000;
  }

  .splash {
    position: absolute;
    width: 70%;
    height: 50%;
    max-width: 900px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    z-index: 1100;
    overflow: hidden;
    border-radius: 2em;
    background-color: #1e1e2e;

    box-shadow: 0px 10px 10px 10px rgba(0, 0, 0, 0.1);
  }

  .grid-container {
    display: grid;
    grid-template-columns: 40% 60%;
    height: 100%;
    width: 100%;
  }

  .banner {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .banner > img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  .content {
    padding: 4em;
    color: white;
    height: 100%;
    width: 100%;
    overflow: hidden;
    z-index: 1200;
    box-shadow: 2px 0px 10px 10px rgba(0, 0, 0, 0.35);
  }

  h2 {
    font-size: 1em;
    margin-left: 1em;
    float: right;
    color: white;
    opacity: 0.8;
  }

  i {
    font-size: 0.8em;
    opacity: 0.8;
  }
</style>
