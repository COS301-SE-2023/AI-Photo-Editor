<script lang="ts">
  // import { writable } from "svelte/store";
  // import { Slider } from "blix_svelvet";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/TileUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  const { min, max, step, value } = props as {
    min: number;
    max: number;
    step: number;
    value: number;
  };

  // if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable(0);

  // $: valStore = inputStore.inputs[config.componentId];
</script>

{#if config.type === "sidebar"}
  <div class="wrapperv">
    <input
      class="sliderv"
      type="range"
      min="{min}"
      max="{max}"
      value="{value}"
      aria-label="{config.label}"
    />
  </div>
{:else}
  <div class="wrapperh">
    <input
      class="sliderh"
      type="range"
      min="{min}"
      max="{max}"
      value="{value}"
      aria-label="{config.label}"
      on:drag="{(e) => {
        console.log(e);
      }}"
    />
  </div>
{/if}

<style>
  .wrapperh {
    /* position: relative; */
    height: 60px;
    width: 20rem;

    &::before,
    &::after {
      display: inline-flex;
      position: absolute;
      z-index: 99;
      color: #fff;
      width: 100%;
      /* text-align: center; */
      font-size: 1.5rem;
      line-height: 1;
      padding: 0.8rem 0.75rem;
      pointer-events: none;
    }

    &::before {
      content: "+";
    }

    &::after {
      content: "−";
      transform: translateX(-2.3rem);
    }
  }

  .wrapperv {
    position: relative;
    height: 20rem;
    width: 100%;

    &::before,
    &::after {
      display: block;
      position: absolute;
      z-index: 99;
      color: #fff;
      width: 100%;
      text-align: center;
      font-size: 1.5rem;
      line-height: 1;
      padding: 0.75rem 0;
      pointer-events: none;
    }

    &::before {
      content: "+";
    }

    &::after {
      content: "−";
      bottom: 0;
    }
  }
  /* input[type="range"] {
  margin: 0;
  padding: 0;
  width: 20rem;
  height: 3.5rem;
  transform: translate(-50%, -50%) rotate(-90deg);
  border-radius: 1rem;
  cursor: row-resize;
} */

  .sliderh {
    background: #1f1f28;
    /* top: 50%;
  left: 50%; */
    margin: 0;
    cursor: ew-resize;
    padding: 0;
    width: 100%;
    height: 3.5rem;
    border-radius: 1rem;
    overflow: hidden;
    -webkit-appearance: none;
  }

  .sliderv {
    background: #1f1f28;
    transform: translate(-50%, -50%) rotate(-90deg);
    cursor: row-resize;
    position: absolute;
    top: 50%;
    left: 50%;
    margin: 0;
    padding: 0;
    width: 20rem;
    height: 3.5rem;
    border-radius: 1rem;
    overflow: hidden;
    -webkit-appearance: none;
  }

  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    input[type="range"]::-webkit-slider-runnable-track {
      height: 10px;
      -webkit-appearance: none;
      color: #13bba4;
      margin-top: -1px;
    }

    input[type="range"]::-webkit-slider-thumb {
      width: 0px;
      -webkit-appearance: none;
      background: #434343;
      box-shadow: -20rem 0 0 20rem #f43e5c;
    }
  }
</style>
