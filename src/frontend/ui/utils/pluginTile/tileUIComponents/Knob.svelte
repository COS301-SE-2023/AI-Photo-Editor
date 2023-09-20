<script lang="ts">
  // import { writable } from "svelte/store";
  // import { Knob } from "blix_svelvet";
  import type { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  const { min, max, step } = props as { min: number; max: number; step: number };

  // if (!inputStore.inputs[config.componentId]) inputStore.inputs[config.componentId] = writable(0);
</script>

{#if config.type === "sidebar"}
  <div class="wrapper">
    <div class="knob-container">
      <div
        tabindex="{0}"
        id="knob"
        class="knobv"
        aria-label="knob component"
        role="slider"
        aria-valuemin="{min}"
        aria-valuemax="{max}"
      ></div>
      <div class="indicator"></div>
    </div>
    <div class="knob-value">
      {1}
    </div>
  </div>
{:else}
  <div class="wrapper">
    <div class="knob-container">
      <div
        tabindex="{0}"
        id="knob"
        class="knobh"
        aria-label="knob component"
        role="slider"
        aria-valuemin="{min}"
        aria-valuemax="{max}"
      ></div>
      <div class="indicator"></div>
    </div>
    <div class="knob-value">
      {1}
    </div>
  </div>
{/if}

<style>
  * {
    box-sizing: border-box;
  }

  .wrapper {
    display: flex;
    gap: 0.5rem;
    position: relative;
    justify-content: center;
    align-items: center;
    height: min-content;
    width: min-content;
  }

  .knobv {
    display: flex;
    border-radius: 50%;
    width: 3.5rem;
    height: 3.5rem;
    pointer-events: auto;
    cursor: pointer;
    padding: 0.25rem;
    background-color: #1f1f28;
  }

  .knobh {
    display: flex;
    border-radius: 50%;
    width: 4.5rem;
    height: 4.5rem;
    pointer-events: auto;
    cursor: pointer;
    padding: 0.25rem;
    background-color: #1f1f28;
  }

  .indicator {
    top: 80%;
    left: 48%;
    transform-origin: 50% -50%;
    position: absolute;
    width: 4%;
    height: 15%;
    background-color: #666565;
    border-radius: 30%/10%;
    pointer-events: none;
  }
  .knob-value {
    position: absolute;
    top: 80%;
    left: 50%;
    transform: translate(-50%, 50%);
    font-size: 1em;
    color: white;
    z-index: 100;
  }
</style>
