<script lang="ts">
  import Fa from "svelte-fa";
  import {
    faAngleUp,
    faAngleDown,
    faAngleLeft,
    faAngleRight,
    faArrowsLeftRightToLine,
    faPlus,
    faXmark,
  } from "@fortawesome/free-solid-svg-icons";

  export let icon: string | null = null;

  const iconMap = {
    u: { icon: faAngleUp },
    d: { icon: faAngleDown },
    l: { icon: faAngleLeft },
    r: { icon: faAngleRight },
    x: { icon: faXmark },
    "+": { icon: faPlus },
    "-": { icon: faArrowsLeftRightToLine },
    "|": { icon: faArrowsLeftRightToLine, rotate: 90 },
  };

  function getIcon() {
    if (icon && icon in iconMap) {
      return iconMap[icon];
    }
    return undefined;
  }

  let panelWidth: number;
  let panelHeight: number;
</script>

{#if icon !== null}
  <div class="fullPanel" bind:clientWidth="{panelWidth}" bind:clientHeight="{panelHeight}">
    <div
      class="icon
            {panelWidth < 300 || panelHeight < 300 ? 'small' : ''}
            {panelWidth < 100 || panelHeight < 100 ? 'smaller' : ''}
    "
    >
      <Fa icon="{getIcon().icon}" rotate="{getIcon().rotate ?? 0}" />
    </div>
  </div>
{/if}

<style>
  .fullPanel {
    position: absolute;
    z-index: 10000000;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: grey;
    opacity: 0.1;

    display: flex;
    justify-content: center;
    align-items: center;

    text-align: center;

    pointer-events: all;
  }
  .icon {
    position: relative;
    font-size: 20em;
    color: white;
  }

  .small {
    font-size: 10em;
  }

  .smaller {
    font-size: 3em;
  }
</style>
