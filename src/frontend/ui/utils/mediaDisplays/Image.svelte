<script lang="ts">
  export let src = "";
</script>

{#if src !== ""}
  <img src="{src}" alt="" class="max-h-[600px]" />
{:else}
  <div class="noImage">No image selected</div>
{/if}

<style>
  .noImage {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    margin-top: 2em;
    font-size: 1em;
    color: #aaa;
  }
</style>
