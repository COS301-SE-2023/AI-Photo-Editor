<!-- This pane is for showing media content large-scale -->
<script lang="ts">
  import Image from "../../components/Image.svelte";

  let test: string;

  function asdf(e: Event) {
    test = (e.target as HTMLInputElement).value;
  }

  let options = ["asdf", "fdsa", "qwer", "rewq"];

  let selected: string;
</script>

<div class="fullPane">
  {test}

  <!-- Rather use bind: -->
  <input type="text" name="asdf" id="asdf" on:input="{asdf}" />

  <select value="{selected}">
    {#each options as option}
      <option value="{option}">
        {option}
      </option>
    {/each}
  </select>

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
    width: 100%;
    height: auto;
    border: 1px solid blue;
  }
</style>
