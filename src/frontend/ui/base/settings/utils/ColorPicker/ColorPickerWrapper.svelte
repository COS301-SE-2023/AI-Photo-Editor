<script lang="ts">
  import { portal } from "svelte-portal";

  export let wrapper: HTMLElement;
  export let isOpen: boolean;
  export let isPopup: boolean;
  /* svelte-ignore unused-export-let */
  export let toRight: boolean;
</script>

<div
  use:portal="{'#settings-portal'}"
  class="wrapper"
  bind:this="{wrapper}"
  class:isOpen="{isOpen}"
  class:isPopup="{isPopup}"
  role="{isPopup ? 'dialog' : undefined}"
  aria-label="color picker"
  on:mousedown|stopPropagation
>
  <span class="inputs">
    <slot />
  </span>
</div>

<style>
  div {
    padding: 8px 5px 5px 8px;
    background-color: #11111b;
    margin: 0 10px 10px;
    border: 1px solid grey;
    border-radius: 12px;
    display: none;
    width: max-content;

    cursor: default;
  }
  .inputs {
    cursor: pointer;
  }

  .isOpen {
    display: block;
  }
  .isPopup {
    position: absolute;
    z-index: var(--picker-z-index, 2);
  }
</style>
