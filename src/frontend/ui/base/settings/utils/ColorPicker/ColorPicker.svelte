<script lang="ts">
  import { type ColorPicker } from "../../../../../../shared/types";

  export let item: ColorPicker;
  let inputElement: HTMLInputElement;

  function handleClick() {
    inputElement.style.position = "absolute";
    inputElement.click();
  }
</script>

<div
  class="h-8 w-8 rounded-full border-2 border-zinc-600 bg-primary-500"
  on:click="{handleClick}"
  on:keydown="{null}"
>
  <input class="invisible" type="color" bind:this="{inputElement}" bind:value="{item.value}" />
</div>

<style lang="scss">
  :root {
    --picker-height: 150px;
  }

  input {
    border-radius: 100%;
  }

  .popup .popuptext {
    background-color: red;
  }
</style>
