<script context="module" lang="ts">
  export type SettingsContext = {
    saveSettings: (settings: Setting[]) => Promise<void>;
    getSetting: (key: string) => Promise<QueryResponse>;
  };
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import type { Setting, QueryResponse } from "../../../../shared/types";
  import { toastStore } from "../../../lib/stores/ToastStore";
  import { settingsStore } from "../../../lib/stores/SettingsStore";
  import { userSettingSections, type UserSettingsCategoryId } from "../../../../shared/types";

  import About from "./AiSettings.svelte";
  import AiSettings from "./About.svelte";
  import Hotkeys from "./Hotkeys.svelte";

  let selectedCategoryId: UserSettingsCategoryId = "about";

  setContext<SettingsContext>("settings", {
    saveSettings,
    getSetting,
  });

  async function saveSettings(settings: Setting[]) {
    const res = await window.apis.utilApi.saveUserSettings(settings);

    if (res.status === "success") {
      toastStore.trigger({
        message: "Your preferences have been updated successfully",
        type: "success",
      });
    } else {
      toastStore.trigger({
        message: "Something went wrong while updating your preferences",
        type: "error",
      });
    }
  }

  async function getSetting(key: string) {
    return await window.apis.utilApi.getUserSetting(key);
  }

  const userSettingsComponentMap: Record<
    UserSettingsCategoryId,
    ConstructorOfATypedSvelteComponent
  > = {
    about: About,
    hotkeys: Hotkeys,
    ai: AiSettings,
  };
</script>

<div class="absolute left-0 top-0 z-[10000000] h-full w-full">
  <!---------------------- Backdrop ---------------------->
  <div
    class="absolute left-0 top-0 h-full w-full bg-black opacity-40"
    on:click="{() => settingsStore.hideSettings()}"
    on:keydown="{null}"
  ></div>

  <!---------------------- Settings Page ---------------------->
  <div
    class="fixed inset-0 m-auto flex h-[75%] w-[60%] select-none overflow-hidden rounded-lg border border-zinc-600 bg-zinc-800"
  >
    <div
      class="group absolute right-2 top-2 flex items-center justify-center rounded-md hover:bg-zinc-700"
      on:click="{() => settingsStore.hideSettings()}"
      on:keydown="{null}"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="h-6 w-6 stroke-zinc-400 group-hover:stroke-zinc-300"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </div>

    <!---------------------- Sections ---------------------->
    <section class="flex h-full w-52 flex-col border-r border-r-zinc-600 bg-zinc-900 p-3">
      {#each userSettingSections as section (section.id)}
        <div class="flex flex-col space-y-2">
          <span class="px-3 text-sm font-semibold text-zinc-400">{section.title}</span>

          {#each section.categories as category (category.id)}
            <span
              class="rounded-md px-3 py-1 font-normal text-zinc-300 {selectedCategoryId ===
              category.id
                ? 'bg-rose-700'
                : 'hover:bg-rose-300/5'}"
              on:click="{() => (selectedCategoryId = category.id)}"
              on:keydown="{() => (selectedCategoryId = category.id)}">{category.title}</span
            >
          {/each}
        </div>
      {/each}
    </section>

    <!---------------------- Content ---------------------->
    <section class="h-full w-full p-10">
      {#if selectedCategoryId in userSettingsComponentMap}
        {#key selectedCategoryId}
          <svelte:component this="{userSettingsComponentMap[selectedCategoryId]}" />
        {/key}
      {:else}
        <div
          class="flex h-full w-full items-center justify-center text-xl font-semibold text-zinc-400"
        >
          <div class="coming-soon flex h-48 w-64 items-center justify-center">Coming Soon</div>
        </div>
      {/if}
    </section>
  </div>
</div>

<!-- <div class="absolute left-0 top-0 z-[10000000] h-full w-full">
  <div
    class="absolute left-0 top-0 h-full w-full bg-black opacity-40"
    on:click="{() => settingsStore.hideSettings()}"
    on:keydown="{null}"
  ></div>
  <div
    class="fixed inset-0 m-auto flex h-[75%] w-[60%] select-none overflow-hidden rounded-lg border border-zinc-600 bg-zinc-800"
  >
    <div
      class="group absolute right-2 top-2 flex items-center justify-center rounded-md hover:bg-zinc-700"
      on:click="{() => settingsStore.hideSettings()}"
      on:keydown="{null}"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="h-6 w-6 stroke-zinc-400 group-hover:stroke-zinc-300"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </div>
    <div class="flex h-full w-52 flex-col border-r border-r-zinc-600 bg-zinc-900 p-3">
      <div class="flex flex-col space-y-2">
        <span class="px-3 text-sm font-semibold text-zinc-400">General</span>
        {#each categories as category}
          <span
            class="rounded-md px-3 py-1 font-normal text-zinc-300 {selectedCategoryId ===
            category.id
              ? 'bg-rose-700'
              : 'hover:bg-rose-300/5'}"
            on:click="{() => (selectedCategoryId = category.id)}"
            on:keydown="{null}">{category.title}</span
          >
        {/each}
      </div>
    </div>
    <div class="h-full w-full p-10">
      {#if selectedCategory?.id === "ai_settings"}
        <div class="pb-2 text-3xl font-semibold text-zinc-300">API Keys</div>
        <div class="mb-10 text-justify text-sm font-medium text-zinc-500">
          Rest assured that none of your API keys get stored remotely. Your information is encrypted
          and maintained securely and solely within the confines of your own device.
        </div>
        {#each selectedCategory.settings as item (item.id)}
          <div class="pb-3">
            <label for="{item.id}" class="pb-3">
              <div class="text-normal font-semibold text-zinc-300">{item.title}</div>
              {#if item.subtitle}
                <div class="font-ligt text-sm text-zinc-500">{item.subtitle}</div>
              {/if}
            </label>
            {#if item.type === "password"}
              <SecureInput
                bind:value="{item.value}"
                id="{item.id}"
                placeholder="{item.placeholder}"
              />
            {:else if item.type === "dropdown"}
              <select
                bind:value="{item.value}"
                class="h-9 rounded-md border-none bg-zinc-800/70 px-2 text-zinc-400 ring-1 ring-zinc-600 focus:outline-none"
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
            if (selectedCategory) saveSettings(selectedCategory?.settings);
          }}"
          on:keydown="{null}"
        >
          Save
        </div>
      {:else if selectedCategory?.id === "keybind_settings"}
        {#each selectedCategory.settings as item (item.id)}
          <div>
            <label for="{item.id}" class="pb-3">
              <div class="text-normal font-semibold text-zinc-300">{item.title}</div>
              <div class="font-ligt text-sm text-zinc-500">{item.subtitle}</div>
            </label>
            {#if item.type === "preferences"}
              <ShortcutSettings bind:settings="{item.value}" />
            {/if}
          </div>
        {/each}
        <div
          class="mt-12 flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/[0.7] text-gray-300 transition duration-300 ease-in-out hover:text-zinc-500"
          on:click="{() => {
            if (selectedCategory) {
              saveSettings(selectedCategory?.settings);
            }
          }}"
          on:keydown="{null}"
        >
          Save
        </div>
      {:else}
        <div
          class="flex h-full w-full items-center justify-center text-xl font-semibold text-zinc-400"
        >
          <div class="coming-soon flex h-48 w-64 items-center justify-center">Coming Soon</div>
        </div>
      {/if}
    </div>
  </div>
</div> -->
