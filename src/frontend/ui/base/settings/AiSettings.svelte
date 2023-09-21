<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { Setting } from "../../../../shared/types";
  import type { SettingsContext } from "./Settings.svelte";
  import SettingsItem from "./utils/SettingsItem.svelte";

  const { getSetting, saveSettings } = getContext<SettingsContext>("settings");

  let settings: Setting[] = [
    {
      id: "OPENAI_API_KEY",
      title: "Open AI Key",
      subtitle: "Required to use Open AI models",
      type: "text",
      secret: true,
      value: "",
    },
    {
      id: "model",
      title: "Open AI Model",
      type: "dropdown",
      value: "",
      options: ["GPT-3.5", "GPT-4"],
    },
  ];
  let initializedSettings = false;

  onMount(async () => {
    const updatedSettings = await Promise.all(
      settings.map(async (setting) => {
        const res = await getSetting(setting);

        if (res.status === "success" && res.data) {
          return { ...setting, value: res.data as any };
        }

        return setting;
      })
    );

    settings = updatedSettings;
    initializedSettings = true;
  });

  $: if (initializedSettings) saveSettings(settings);
</script>

<div class="h-full w-full p-10">
  <div class="pb-2 text-3xl font-semibold text-zinc-300">API Keys</div>
  <div class="mb-10 text-justify text-sm font-medium text-zinc-500">
    Rest assured that none of your API keys get stored remotely. Your information is encrypted and
    maintained securely and solely within the confines of your own device.
  </div>

  {#each settings as item (item.id)}
    <SettingsItem bind:item="{item}" />
  {/each}
</div>
