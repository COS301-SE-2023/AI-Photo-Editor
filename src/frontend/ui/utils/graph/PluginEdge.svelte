<script lang="ts">
  import { Edge } from "svelvet";

  export let label: string = "";
</script>

<Edge let:path let:destroy edgeClick="{() => console.log('Edge clicked')}" step>
  <path d="{path}"></path>
  <button on:click="{destroy}" slot="label">
    <p class="text-white">Custom Label</p>
  </button>
</Edge>

<style>
  path {
    stroke: rgb(246, 190, 20);
    stroke-width: 4px;
  }
</style>
