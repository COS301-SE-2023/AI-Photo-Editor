<script lang="ts">
  import type { TileUIComponent, TileUILeaf, UIComponentConfig } from "@shared/ui/TileUITypes";
  import Button from "./tileUIComponents/Button.svelte";
  import Slider from "./tileUIComponents/Slider.svelte";
  import ColorPicker from "./tileUIComponents/ColorPicker.svelte";
  import Knob from "./tileUIComponents/Knob.svelte";
  import Dropdown from "./tileUIComponents/Dropdown.svelte";
  import TextInput from "./tileUIComponents/TextInput.svelte";
  import FilePicker from "./tileUIComponents/FilePicker.svelte";

  export let leafUI: TileUILeaf | null = null;
  export let uiConfigs: { [key: string]: UIComponentConfig };

  const mapToSvelteComponent: { [key in TileUIComponent]: any } = {
    Button: Button,
    Slider: Slider,
    Knob: Knob,
    Label: null,
    Radio: null,
    Dropdown: Dropdown,
    Accordion: null,
    NumberInput: null,
    TextInput: TextInput,
    Checkbox: null,
    ColorPicker: ColorPicker,
    FilePicker: FilePicker,
  };
</script>

{#if leafUI}
  {#if mapToSvelteComponent[leafUI.category] !== null}
    <svelte:component
      this="{mapToSvelteComponent[leafUI.category]}"
      props="{leafUI.params[0]}"
      config="{uiConfigs[leafUI.label]}"
    />
  {/if}
{/if}
