<script lang="ts">
  import { getContext } from "svelte";
  import type { Setting } from "../../../../shared/types";
  import type { SettingsContext } from "./Settings.svelte";
  import { blixStore } from "../../../lib/stores/BlixStore";
  import Button from "./utils/Button.svelte";

  let settings: Setting[] = [];
  let checkingForUpdates = false;

  async function checkForUpdates() {
    checkingForUpdates = true;
    await blixStore.checkForUpdates();
    await sleep(400);
    checkingForUpdates = false;
  }

  function sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  // const { getSetting, saveSettings } = getContext<SettingsContext>("settings");
</script>

<div class="h-full w-full p-10">
  <!---------------------- Version Details ---------------------->
  <div class="flex items-center border-t border-zinc-700 pb-3 pt-3">
    <div>
      <div class="text-normal font-semibold text-zinc-300">
        Current Version: {$blixStore.blix.version}
      </div>
      <div class="pb-3 text-sm text-zinc-500">Blix is up-to-date!</div>
      {#if checkingForUpdates}
        <div class="text-sm font-light text-zinc-500">Checking for updates...</div>
      {/if}
    </div>

    <div class="ml-auto flex items-center space-x-2 self-start">
      <Button title="Check for updates" onClick="{() => checkForUpdates()}" />
    </div>
  </div>

  <!---------------------- Help Details ---------------------->
  <div class="flex items-center border-t border-zinc-700 pb-3 pt-3">
    <div>
      <div class="text-normal font-semibold text-zinc-300">Get help</div>
      <div class="pb-3 text-sm text-zinc-500">Get help on using Blix.</div>
    </div>

    <div class="ml-auto flex items-center space-x-2 self-start">
      <Button title="Open" onClick="{() => ({})}" />
    </div>
  </div>
</div>
