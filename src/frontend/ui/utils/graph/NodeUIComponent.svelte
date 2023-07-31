<script lang="ts">
  import { NodeUIComponent, type NodeUILeaf, type UIComponentConfig } from "@shared/ui/NodeUITypes";
  import Button from "./nodeUICcomponents/Button.svelte";
  import Slider from "./nodeUICcomponents/Slider.svelte";
  import ColorPicker from "./nodeUICcomponents/ColorPicker.svelte";
  import Knob from "./nodeUICcomponents/Knob.svelte";
  import type { UIValueStore } from "@shared/ui/UIGraph";
  import Dropdown from "./nodeUICcomponents/Dropdown.svelte";
  import TextInput from "./nodeUICcomponents/TextInput.svelte";
  import FilePicker from "./nodeUICcomponents/FilePicker.svelte";

  export let leafUI: NodeUILeaf | null = null;
  export let inputStore: UIValueStore;
  export let uiConfigs: { [key: string]: UIComponentConfig };

  const mapToSvelteComponent: { [key in NodeUIComponent]: any } = {
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
      inputStore="{inputStore}"
      props="{leafUI.params[0]}"
      config="{uiConfigs[leafUI.label]}"
    />
  {/if}
{/if}
