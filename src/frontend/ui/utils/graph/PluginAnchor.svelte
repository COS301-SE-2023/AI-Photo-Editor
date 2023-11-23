<script lang="ts">
  import { type CSSColorString } from "blix_svelvet";

  type PluginAnchorIcon = "circle" | "arrow-left" | "arrow-right" | "amogus";

  export let output: boolean;
  export let input: boolean;
  export let icon: PluginAnchorIcon = "circle";
  export let connecting: boolean;
  export let connected: boolean;
  export let hovering: boolean;
  export let bgColor: CSSColorString | null;
</script>

<div
  class:circle="{icon === 'circle'}"
  class:arrow-left="{icon === 'arrow-left'}"
  class:arrow-right="{icon === 'arrow-right'}"
  class:amogus="{icon === 'amogus'}"
  class:output="{output}"
  class:input="{input}"
  class:connected="{connected}"
  class:connecting="{connecting}"
  class:hovering="{hovering}"
  style:--prop-anchor-color="{bgColor}"
>
  {#if icon === "amogus"}
    ඞ
  {/if}
</div>

<style>
  * {
    box-sizing: border-box;
  }

  .circle {
    width: var(--anchor-width, var(--default-anchor-size));
    height: var(--anchor-height, var(--default-anchor-size));
    border-radius: var(--anchor-radius, var(--default-anchor-radius));
    background-color: var(--prop-anchor-color, var(--anchor-color, var(--default-anchor-color)));
    z-index: 12;
    cursor: pointer;
    box-shadow: 0 0 0px 1px var(--anchor-border-color, var(--default-anchor-border-color));
    pointer-events: auto;
  }

  .arrow-left {
    width: 0;
    height: 0;
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
    border-right: 7px solid var(--prop-anchor-color);
  }

  .arrow-right {
    width: 0;
    height: 0;
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
    border-left: 7px solid var(--prop-anchor-color);
  }

  .amogus {
    color: var(--prop-anchor-color, var(--anchor-color, var(--default-anchor-color)));
    z-index: 12;
    cursor: pointer;
    pointer-events: auto;
  }

  .connecting {
    /* background-color: var(--anchor-connecting, var(--default-anchor-connecting)); */
    /* filter: brightness(1.2); */
    outline: 1px solid var(--prop-anchor-color);
    box-shadow: 0 0 0px 1px var(--anchor-connecting-border, var(--default-anchor-connecting-border));
  }

  .hovering {
    background-color: var(--anchor-hovering, var(--default-anchor-hovering));
    box-shadow: 0 0 0px 1px var(--anchor-hovering-border, var(--default-anchor-hovering-border));
  }

  .connected {
    background-color: var(--anchor-connected, var(--default-anchor-connected));
    box-shadow: 0 0 0px 1px var(--anchor-connected-border, var(--default-anchor-connected-border));
  }

  div {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }
</style>
