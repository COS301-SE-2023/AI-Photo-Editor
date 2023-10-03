<script lang="ts">
  // import { tick } from "svelte";
  // import ColorPickerComponent from "svelte-awesome-color-picker";
  import { type ColorPicker } from "../../../../../shared/types";

  export let item: ColorPicker;
  let inputElement: HTMLInputElement;

  // async function handleChange(event: Event) {
  //   console.log("here")
  //   if (item.onChange) {
  //     await tick();
  //     item.onChange(item.value);
  //   }
  // }

  $: {
    if (item.onChange) {
      item.onChange(item.value);
    }
  }

  function handleClick() {
    inputElement.style.position = "absolute";
    inputElement.click();
  }
</script>

<!-- <ColorPickerComponent isAlpha={false} label=""/> -->
<input type="color" bind:this="{inputElement}" class="" />

<!-- <div class="rounded-full h-7 w-7 bg-primary-500" on:click="{handleClick}" on:keydown="{null}"> -->
<!-- </div> -->

<style lang="scss">
  :root {
    --picker-height: 150px;
    --picker-z-index: 2147483647;
  }

  input {
    border-radius: 100%;
  }
</style>
