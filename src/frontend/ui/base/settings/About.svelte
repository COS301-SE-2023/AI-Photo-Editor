<script lang="ts">
  import { onMount } from "svelte";
  import type { Setting } from "../../../../shared/types";
  import { blixStore } from "../../../lib/stores/BlixStore";
  import SettingsItem from "./utils/SettingsItem.svelte";

  let checkingForUpdates = false;

  let versionItem: Setting = {
    id: "version",
    title: "Current Version: ",
    subtitle: "",
    components: [],
  };

  let helpItem: Setting = {
    id: "help",
    title: "Get help",
    subtitle: "Get help on using Blix.",
    components: [
      {
        id: "open-help",
        value: "Open",
        type: "button",
        onClick: () => ({}),
      },
    ],
  };

  onMount(() => {
    return blixStore.subscribe((state) => {
      versionItem.title = `Current Version: v${state.blix.version}`;

      versionItem.subtitle = state.update.isAvailable
        ? `Update is available: v${state.update.version}`
        : "Blix is up to date!";

      if (state.update.isAvailable) {
        if (state.update.isDownloaded) {
          versionItem.components = [
            {
              id: "quit-and-install",
              value: "Quit and install update",
              type: "button",
              onClick: quitAndInstallUpdate,
            },
          ];
        } else {
          versionItem.components = [
            {
              id: "download-update",
              value: "Download update",
              type: "button",
              onClick: downloadUpdate,
            },
          ];
        }
      } else {
        versionItem.components = [
          {
            id: "check-for-updates",
            value: "Check for updates",
            type: "button",
            onClick: checkForUpdates,
          },
        ];
      }
    });
  });

  async function checkForUpdates() {
    checkingForUpdates = true;
    await blixStore.checkForUpdates();
    await sleep(400);
    checkingForUpdates = false;
  }

  async function downloadUpdate() {
    // await blixStore.downloadUpdate();
  }

  async function quitAndInstallUpdate() {
    await window.apis.utilApi.quitAndInstallUpdates();
  }

  function sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
</script>

<div class="h-full w-full p-10">
  <SettingsItem item="{versionItem}">
    {#if checkingForUpdates}
      <div class="text-sm font-light text-zinc-500">Checking for updates...</div>
    {/if}
  </SettingsItem>

  <SettingsItem item="{helpItem}" />
</div>
