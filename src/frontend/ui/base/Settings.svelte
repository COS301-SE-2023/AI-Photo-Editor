<script lang="ts">
  import { onMount } from "svelte";
  import type { UserSettingsCategory, Setting } from "../../../shared/types";
  import SecureInput from "../../ui/utils/SecureInput.svelte";
  import { toastStore } from "./../../lib/stores/ToastStore";
  import { settingsStore } from "../../lib/stores/SettingsStore";

  let selectedCategoryId = "";
  let selectedCategory: UserSettingsCategory | undefined;
  let categories: UserSettingsCategory[] = [];

  $: selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  onMount(async () => {
    const res = await window.apis.utilApi.getUserSettings();
    if (res.status === "success" && res.data) {
      categories = res.data;
      selectedCategoryId = categories.length ? categories[0].id : "";
    }
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
        type: "success",
      });
    }
  }
</script>

<div class="absolute left-0 top-0 z-[10000000] h-full w-full">
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
          <div>
            <label for="{item.id}" class="pb-3">
              <div class="text-normal font-semibold text-zinc-300">{item.title}</div>
              <div class="font-ligt text-sm text-zinc-500">{item.subtitle}</div>
            </label>
            {#if item.type === "password"}
              <SecureInput
                bind:value="{item.value}"
                id="{item.id}"
                placeholder="{item.placeholder}"
              />
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
        <!-- {:else}
        <div
          class="flex h-full w-full items-center justify-center text-xl font-semibold text-zinc-400"
        >
          <div class="coming-soon flex h-48 w-64 items-center justify-center">Coming Soon</div>
        </div> -->
      {/if}
    </div>
  </div>
</div>
