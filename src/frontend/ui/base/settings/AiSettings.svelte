<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { Setting } from "../../../../shared/types";
  import type { SettingsContext } from "./Settings.svelte";
  import SettingsItem from "./utils/SettingsItem.svelte";

  const { getSettingValue, saveSettings } = getContext<SettingsContext>("settings");

  let initializedSettings = false;

  let settings: Setting[] = [
    {
      id: "OpenAiKey",
      title: "Open AI Key",
      subtitle: "Required to use Open AI models",
      components: [
        {
          id: "OPENAI_API_KEY",
          type: "text",
          secret: true,
          value: "",
        },
      ],
    },
    {
      id: "OpenAiModel",
      title: "Open AI Model",
      components: [
        {
          id: "model",
          type: "dropdown",
          value: "",
          options: ["GPT-3.5", "GPT-4"],
        },
      ],
    },
  ];

  onMount(async () => {
    for (const setting of settings) {
      for (const component of setting.components) {
        const res = await getSettingValue(component);

        if (res.status === "success" && res.data) {
          component.value = res.data as any;
        }
      }
    }

    settings = [...settings];
    initializedSettings = true;
  });

  $: if (initializedSettings) saveSettings(settings.flatMap((setting) => setting.components));
</script>

<div class="h-full w-full p-10">
  <div class="pb-2 text-3xl font-semibold text-zinc-300">API Keys</div>
  <div class="mb-10 text-justify text-sm font-medium text-zinc-500">
    None of your API keys get stored remotely. Your information is encrypted and maintained securely
    and solely within the confines of your own device.
  </div>

  {#each settings as item (item.id)}
    <SettingsItem bind:item="{item}" />
  {/each}
</div>
