<script lang="ts">
  import { NodeUIComponent, type NodeUILeaf } from "@shared/ui/NodeUITypes";
  import Button from "./nodeUICcomponents/Button.svelte";
  import Slider from "./nodeUICcomponents/Slider.svelte";
  import ColorPicker from "./nodeUICcomponents/ColorPicker.svelte";
  import Knob from "./nodeUICcomponents/Knob.svelte";
  import type { AnchorValueStore } from "@shared/ui/UIGraph";

  export let leafUI: NodeUILeaf | null = null;
  export let inputStore: AnchorValueStore;

  const mapToSvelteComponent: { [key in NodeUIComponent]: any } = {
    Button: Button,
    Slider: Slider,
    Knob: Knob,
    Label: null,
    Radio: null,
    Dropdown: null,
    NumberInput: null,
    TextInput: null,
    Checkbox: null,
    ColorPicker: ColorPicker,
    FilePicker: null,
  };
</script>

{#if leafUI}
  {#if mapToSvelteComponent[leafUI.category] !== null}
    <svelte:component this="{mapToSvelteComponent[leafUI.category]}" {inputStore} />
  {/if}
{/if}
