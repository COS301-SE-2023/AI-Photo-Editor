<script lang="ts">
  // import type { Setting } from "../../../../shared/types";
  import { blixStore } from "../../../lib/stores/BlixStore";
  import SettingsItem from "./utils/SettingsItem.svelte";

  // let settings: Setting[] = [];
  let checkingForUpdates = false;

  async function checkForUpdates() {
    checkingForUpdates = true;
    console.log(JSON.stringify(await blixStore.checkForUpdates()));
    await sleep(400);
    checkingForUpdates = false;
  }

  function sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
</script>

<div class="h-full w-full p-10">
  <SettingsItem
    item="{{
      id: 'version',
      title: `Current Version: ${$blixStore.blix.version}`,
      subtitle: $blixStore.update.isAvailable
        ? `Update is available: ${$blixStore.update.version}`
        : 'Blix is up to date',
      value: 'Check for updates',
      type: 'button',
      onClick: checkForUpdates,
    }}"
  >
    {#if checkingForUpdates}
      <div class="text-sm font-light text-zinc-500">Checking for updates...</div>
    {/if}
  </SettingsItem>

  <SettingsItem
    item="{{
      id: 'help',
      title: 'Get help',
      subtitle: 'Get help on using Blix.',
      value: 'Open',
      type: 'button',
      onClick: () => ({}),
    }}"
  />

  <div>Hello World</div>
</div>
