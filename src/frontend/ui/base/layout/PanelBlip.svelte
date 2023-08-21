<!-- The little panel edit dot at the corners of each panel, -->
<!-- tracks mouse movement on drag and returns a direction -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let startPos: [number, number] | null = null;
  let dir = "";

  // Calculates the drag direction from start to end position
  function getDirection(endPos: [number, number]): "u" | "d" | "l" | "r" | null {
    if (startPos === null) return null;

    let delta = [endPos[0] - startPos[0], endPos[1] - startPos[1]];

    // Ignore insufficient magnitude
    const minSqrMag = 20 * 20; // 20px min drag distance

    if (delta[0] ** 2 + delta[1] ** 2 < minSqrMag) return null;

    // Determine delta direction
    if (Math.abs(delta[0]) > Math.abs(delta[1])) {
      //Direction is horizontal
      return delta[0] > 0 ? "r" : "l";
    } else {
      //Direction is vertical
      return delta[1] > 0 ? "d" : "u";
    }
  }

  function tryStartTrack(e: MouseEvent) {
    startPos = [e.screenX, e.screenY];
  }

  function tryEndTrack(e: MouseEvent) {
    if (startPos !== null) {
      let endPos: [number, number] = [e.screenX, e.screenY];
      let dir = getDirection(endPos);

      if (dir !== null) {
        dispatch("blipDragged", { dir: dir });
      }
    }
    startPos = null;
  }

  function mapToCaret(dir: string) {
    switch (dir) {
      case "u":
        return "^";
      case "d":
        return "v";
      case "l":
        return "<";
      case "r":
        return ">";
      default:
        return "";
    }
  }

  function winMouseMove(e: MouseEvent) {
    if (startPos !== null) {
      let endPos: [number, number] = [e.screenX, e.screenY];
      let d = getDirection(endPos);

      // Update UI
      dir = d === null ? "" : mapToCaret(d);

      // Dispatch event
      if (d !== null) {
        dispatch("blipDragging", { dir: d });
      }
    } else {
      dir = "";
    } // Reset UI
  }

  // The corner to dock the blip to
  export let dock = "tl";
</script>

<div
  class="{'blip ' + (['tl', 'tr', 'bl', 'br'].includes(dock) ? dock : 'tl')}"
  on:mousedown|stopPropagation|preventDefault="{tryStartTrack}"
>
  {dir}
</div>
<svelte:window on:mouseup="{tryEndTrack}" on:mousemove="{winMouseMove}" />

<style>
  :root {
    --width: 1em;
    --halfW: calc(var(--width) / 2);
  }
  .tl {
    top: 0px;
    left: 0px;
    border-radius: 0px 0px var(--halfW) 0px;
  }
  .tr {
    top: 0px;
    right: 0px;
    border-radius: 0px 0px 0px var(--halfW);
  }
  .bl {
    bottom: 0px;
    left: 0px;
    border-radius: 0px var(--halfW) 0px 0px;
  }
  .br {
    bottom: 0px;
    right: 0px;
    border-radius: var(--halfW) 0px 0px 0px;
  }

  .blip {
    position: absolute;

    width: var(--width);
    height: var(--width);

    background-color: transparent;
    color: #f38ba8;
    text-align: center;
    font-size: 0.8em;

    /* Prevent mouse selecting neighbouring elements when dragging */
    user-select: none;

    z-index: 10000;
  }
  .blip:hover {
    background-color: #f38ba8;
    cursor: crosshair;
  }
</style>
