<!-- This pane is for showing media content large-scale -->
<script lang="ts">
  import Image from "../../components/Image.svelte";

  let options = ["svelteSoHot"];
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
    <Image src="images/svelte-so-hot.jpg" />
  </div>
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
  }

  .hover {
    position: absolute;
    bottom: 1em;
    left: 1em;
    color: black;
  }
</style>
