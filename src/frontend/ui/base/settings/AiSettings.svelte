<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { Setting } from "../../../../shared/types";
  import type { SettingsContext } from "./Settings.svelte";
  import SecureInput from "./utils/SecureInput.svelte";

  const { getSetting, saveSettings } = getContext<SettingsContext>("settings");

  let settings: Setting[] = [
    {
      id: "OPENAI_API_KEY",
      title: "Open AI Key",
      subtitle: "Required to use Open AI models such as GPT-3.5",
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
  });
</script>

<div class="h-full w-full p-10">
  <div class="pb-2 text-3xl font-semibold text-zinc-300">API Keys</div>
  <div class="mb-10 text-justify text-sm font-medium text-zinc-500">
    Rest assured that none of your API keys get stored remotely. Your information is encrypted and
    maintained securely and solely within the confines of your own device.
  </div>

  {#each settings as item (item.id)}
    <div class="pb-3">
      <label for="{item.id}" class="pb-3">
        <div class="text-normal font-semibold text-zinc-300">{item.title}</div>
        {#if item.subtitle}
          <div class="font-ligt text-sm text-zinc-500">{item.subtitle}</div>
        {/if}
      </label>

      {#if item.type === "text" && item.secret}
        <SecureInput bind:value="{item.value}" id="{item.id}" placeholder="{item.placeholder}" />
      {:else if item.type === "dropdown"}
        <select
          bind:value="{item.value}"
          class="h-9 rounded-md border-none bg-zinc-800/70 px-1 text-zinc-400 ring-1 ring-zinc-600 focus:outline-none"
        >
          {#each item.options as option}
            {#if item.value === option}
              <option value="{option}" selected>{option}</option>
            {:else}
              <option value="{option}">{option}</option>
            {/if}
          {/each}
        </select>
      {/if}
    </div>
  {/each}

  <div
    class="mt-12 flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/[0.7] text-gray-300 transition duration-300 ease-in-out hover:text-zinc-500"
    on:click="{() => {
      saveSettings(settings);
    }}"
    on:keydown="{null}"
  >
    Save
  </div>
</div>
