<script lang="ts">
  import Shortcuts from "../../ui/utils/Shortcuts.svelte";
  import SecureInput from "../../ui/utils/SecureInput.svelte";

  let show = true;
  let selectedSubcategory = "AI Settings";

  const shortcuts = {
    "blix.settings.toggle": () => {
      show = !show;
    },
  };

  const categories = [
    {
      title: "General",
      subcategories: ["Appearance", "AI Settings", "Hotkeys"],
    },
  ];

  interface UserSetting {
    id: string;
    title: string;
    subtitle?: string;
    type: "dropdown" | "password" | "text" | "toggle";
  }

  interface InputSetting extends UserSetting {
    type: "password" | "text";
    placeholder?: string;
    value: string;
  }

  interface DropdownSetting extends UserSetting {
    type: "dropdown";
    options: string[];
    value: string;
  }

  interface ToggleSetting extends UserSetting {
    type: "toggle";
    value: boolean;
  }

  type Setting = DropdownSetting | InputSetting | ToggleSetting;

  const settings: Setting[] = [
    {
      id: "OPEN_AI_API_KEY",
      title: "Open AI Key",
      subtitle: "API key which is needed to use Open AI models such as GPT-3.5",
      type: "password",
      value: "",
    },
  ];
</script>

{#if show}
  <div class="absolute left-0 top-0 h-full w-full">
    <div class="absolute left-0 top-0 h-full w-full bg-black opacity-40"></div>
    <div
      class="fixed inset-0 m-auto flex h-[85%] w-[75%] select-none overflow-hidden rounded-lg border border-zinc-600 bg-zinc-800"
    >
      <div class="flex h-full w-52 flex-col border-r border-r-zinc-600 bg-zinc-900 p-3">
        {#each categories as category}
          <div class="flex flex-col space-y-2">
            <span class="px-3 text-sm font-semibold text-zinc-400">{category.title}</span>
            {#each category.subcategories as subcategory}
              <span
                class="rounded-md px-3 py-1 font-normal text-zinc-300 {selectedSubcategory ===
                subcategory
                  ? 'bg-rose-700'
                  : 'hover:bg-rose-300/5'}"
                on:click="{() => (selectedSubcategory = subcategory)}"
                on:keydown="{null}">{subcategory}</span
              >
            {/each}
          </div>
        {/each}
      </div>
      <div class="h-full w-full p-10">
        {#if selectedSubcategory === "AI Settings"}
          <div class="pb-2 text-3xl font-semibold text-zinc-300">API Keys</div>
          <div class="mb-10 text-justify text-sm font-medium text-zinc-500">
            Rest assured that none of your API keys get stored remotely. Your information is
            encrypted and maintained securely and solely within the confines of your own device.
          </div>
          {#each settings as item (item.id)}
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
  </div>
{/if}

<Shortcuts shortcuts="{shortcuts}" />
