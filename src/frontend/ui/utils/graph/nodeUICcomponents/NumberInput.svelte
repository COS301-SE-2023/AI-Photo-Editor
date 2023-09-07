<script lang="ts">
  import { get, writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  const randomId = Math.random().toString(32);

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable(0);

  let { sensitivity, min, max, step } = props as {
    sensitivity: number;
    min: number;
    max: number;
    step: number;
  };

  sensitivity ??= 0.5;
  step ??= 1;
  min ??= -Infinity;
  max ??= Infinity;

  let initialMouseX: number;
  let initialValue: number;
  let isDragging = false;
  let input: HTMLInputElement;

  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    initialMouseX = e.pageX;
    initialValue = get(valStore) as number;
  }

  function handlePointerUp() {
    isDragging = false;
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    input.blur();

    const delta = (e.pageX - initialMouseX) * sensitivity * step;

    valStore.set(Math.min(max, Math.max(min, Math.floor((initialValue + delta) / step) * step)));
  }

  $: valStore = inputStore.inputs[config.componentId];
</script>

<svelte:window on:pointermove="{handlePointerMove}" on:pointerup="{handlePointerUp}" />

<div class="container">
  <label for="{randomId}-{config.componentId}">{config.label}</label>
  <input
    name="{randomId}-{config.componentId}"
    type="number"
    bind:value="{$valStore}"
    on:pointerdown="{handlePointerDown}"
    bind:this="{input}"
    min="{min}"
    max="{max}"
    step="{step}"
  />
</div>

<style>
  input {
    color: #cdd6f4;
    background-color: #1f1f28;
    border: none;
    padding: 0.1em;

    touch-action: none;
    user-select: none;
    cursor: col-resize;
  }

  label {
    text-align: right;
    clear: both;
    float: left;
    margin-right: 1em;
  }

  .container {
    touch-action: none;
  }
</style>
