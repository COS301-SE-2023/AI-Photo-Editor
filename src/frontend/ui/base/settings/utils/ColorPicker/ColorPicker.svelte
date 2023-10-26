<script lang="ts">
  import { tick } from "svelte";
  import ColorPickerComponent from "svelte-awesome-color-picker";
  import { type ColorPicker } from "../../../../../../shared/types";
  import ColorPickerWrapper from "./ColorPickerWrapper.svelte";
  import ColorPickerTextInput from "./ColorPickerTextInput.svelte";

  export let item: ColorPicker;
  let inputElement: HTMLInputElement;
  let test: string;

  async function handleChange(event: Event) {
    console.log("here");
    if (item.onChange) {
      // await tick();
      item.onChange(item.value);
    }
  }

  $: {
    if (item.onChange) {
      item.onChange(item.value);
    }
  }

  $: console.log(test);

  function handleClick() {
    inputElement.style.position = "absolute";
    inputElement.click();
  }
</script>

<!-- <div id="settings-portal"></div>

<ColorPickerComponent
  bind:hex="{item.value}"
  isAlpha="{false}"
  label=""
  components="{{ wrapper: ColorPickerWrapper, textInput: ColorPickerTextInput }}"
/> -->

<div
  class="bg-primary-500 h-8 w-8 rounded-full border-2 border-zinc-600"
  on:click="{handleClick}"
  on:keydown="{null}"
>
  <input
    class="invisible"
    type="color"
    bind:this="{inputElement}"
    on:change="{handleChange}"
    bind:value="{item.value}"
  />
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
