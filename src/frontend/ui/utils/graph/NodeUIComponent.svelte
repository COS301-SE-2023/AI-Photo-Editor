<script lang="ts">
  import { NodeUIComponent, type NodeUILeaf, type UIComponentConfig } from "@shared/ui/NodeUITypes";
  import Button from "./nodeUIComponents/Button.svelte";
  import Buffer from "./nodeUIComponents/Buffer.svelte";
  import Slider from "./nodeUIComponents/Slider.svelte";
  import ColorPicker from "./nodeUIComponents/ColorPicker.svelte";
  import Knob from "./nodeUIComponents/Knob.svelte";
  import type { UIValueStore } from "@shared/ui/UIGraph";
  import CachePicker from "./nodeUIComponents/CachePicker.svelte";
  import Dropdown from "./nodeUIComponents/Dropdown.svelte";
  import TextInput from "./nodeUIComponents/TextInput.svelte";
  import FilePicker from "./nodeUIComponents/FilePicker.svelte";
  import Radio from "./nodeUIComponents/Radio.svelte";
  import NumberInput from "./nodeUIComponents/NumberInput.svelte";
  import TweakDial from "./nodeUIComponents/dials/TweakDial.svelte";
  import DiffDial from "./nodeUIComponents/dials/DiffDial.svelte";

  export let leafUI: NodeUILeaf | null = null;
  export let inputStore: UIValueStore;
  export let uiConfigs: { [key: string]: UIComponentConfig };

  const mapToSvelteComponent: { [key in NodeUIComponent]: any } = {
    Button: Button,
    Buffer: Buffer,
    TweakDial: TweakDial,
    DiffDial: DiffDial,
    Slider: Slider,
    Knob: Knob,
    CachePicker: CachePicker,
    Label: null,
    Radio: Radio,
    Dropdown: Dropdown,
    Accordion: null,
    NumberInput: NumberInput,
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
      inputStore="{inputStore}"
      props="{leafUI.params[0]}"
      config="{uiConfigs[leafUI.label]}"
    />
  {/if}
{/if}
