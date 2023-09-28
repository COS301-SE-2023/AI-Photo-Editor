<script lang="ts">
  import { get, writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  const randomId = Math.random().toString(32);

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable(0);

  let { rows, cols, sensitivity, min, max, step } = props as {
    rows: number;
    cols: number;
    sensitivity: number;
    min: number;
    max: number;
    step: number;
  };

  rows ??= 3;
  cols ??= 3;
  sensitivity ??= 0.5;
  step ??= 1;
  min ??= -Infinity;
  max ??= Infinity;

  let initialMouseX: number;
  let initialValue: number;
  let draggingIndex: { r: number; c: number } | null = null;
  let input: HTMLInputElement;

  function handlePointerDown(e: PointerEvent, r: number, c: number) {
    draggingIndex = { r, c };
    initialMouseX = e.pageX;
    initialValue = (get(valStore) as number[][])[r][c] as number;
  }

  function handlePointerUp() {
    draggingIndex = null;
  }

  function handlePointerMove(e: PointerEvent) {
    if (draggingIndex == null) return;
    input.blur();

    const delta = (e.pageX - initialMouseX) * sensitivity * step;

    const { r, c } = draggingIndex;

    valStore.update((val) => {
      (val as number[][])[r][c] = Math.min(
        max,
        Math.max(min, Math.floor((initialValue + delta) / step) * step)
      );
      return val;
    });
  }

  $: valStore = inputStore.inputs[config.componentId];
</script>

<svelte:window
  on:pointermove="{handlePointerMove}"
  on:pointerup="{handlePointerUp}"
  on:blur="{handlePointerUp}"
/>

<div class="container">
  <span class="label">{config.label}</span>
  <br />
  <table>
    {#each Array(rows) as _, r}
      <tr>
        {#each Array(cols) as _, c}
          <td>
            {#if Array.isArray($valStore) && Array.isArray($valStore[r])}
              <input
                name="{randomId}[{r}][{c}]-{config.componentId}"
                type="number"
                bind:value="{$valStore[r][c]}"
                on:pointerdown="{(e) => handlePointerDown(e, r, c)}"
                bind:this="{input}"
                min="{min}"
                max="{max}"
                step="{step}"
              />
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </table>
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

    width: 100%;
  }

  input:focus {
    outline: 1px solid #f43e5c;
  }

  .label {
    float: left;
    margin-left: 0.4em;
  }

  .container {
    touch-action: none;
  }
</style>
