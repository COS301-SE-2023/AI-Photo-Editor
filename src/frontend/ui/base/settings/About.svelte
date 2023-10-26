<script lang="ts">
  // import { shell } from "@electron/remote"
  import { onMount, getContext, onDestroy } from "svelte";
  import type { Setting } from "../../../../shared/types";
  import { blixStore } from "../../../lib/stores/BlixStore";
  import SettingsItem from "./utils/SettingsItem.svelte";
  import type { SettingsContext } from "./Settings.svelte";

  const { getSettingValue, saveSettings } = getContext<SettingsContext>("settings");
  let initialized = false;

  let checkingForUpdates = false;

  let versionItem: Setting = {
    id: "version",
    title: "Current version: ",
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
        // TODO: Add proper link to help page
        onClick: () => {
          window.apis.utilApi.openLinkInBrowser(
            "https://armandkrynauw.notion.site/Blix-Manual-84ea5cf8f52149319bd0b43786ef2ef0?pvs=4"
          );
        },
      },
    ],
  };

  let colorAccentItem: Setting = {
    id: "accent-color",
    title: "Accent color",
    subtitle: "Choose the accent color used throughout Blix.",
    components: [
      {
        id: "accent-color",
        type: "colorPicker",
        value: "#f43e5c",
      },
    ],
  };

  function saveAccentColor(item: Setting) {
    const value: string = (item.components[0].value as string) ?? "";
    blixStore.setPrimaryColor(value);
    saveSettings(item.components);
  }

  $: if (initialized) saveAccentColor(colorAccentItem);

  onMount(async () => {
    const res = await getSettingValue(colorAccentItem.components[0]);

    if (res.status === "success" && res.data) {
      colorAccentItem.components[0].value = res.data as any;
      colorAccentItem = colorAccentItem;
    }

    initialized = true;
  });

  const blixStoreUnsubscribe = blixStore.subscribe((state) => {
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
            onClick: () => window.apis.utilApi.quitAndInstallUpdate(),
          },
        ];
      } else if (!state.update.isDownloading) {
        versionItem.components = [
          {
            id: "download-update",
            value: "Download update",
            type: "button",
            onClick: () => window.apis.utilApi.downloadUpdate(),
          },
        ];
      } else {
        versionItem.components = [];
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

    // console.log(state.theme.primary)
    // saveSettings([colorAccentItem.components]);
  });

  onDestroy(() => {
    blixStoreUnsubscribe();
  });

  async function checkForUpdates() {
    checkingForUpdates = true;
    await window.apis.utilApi.checkForUpdates();
    await sleep(400);
    checkingForUpdates = false;
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
    {#if $blixStore.update.isDownloading}
      <div class="text-sm font-light text-zinc-500">
        Downloading update {Math.round($blixStore.update.percentDownloaded)}%...
      </div>
    {/if}
  </SettingsItem>

  <SettingsItem item="{helpItem}" />

  <SettingsItem bind:item="{colorAccentItem}" />
</div>
