<script lang="ts">
  import {
    shortcutsRegistry,
    type ShortcutAction,
    ShortcutCombo,
  } from "@frontend/lib/stores/ShortcutStore";

  let shortcuts = shortcutsRegistry.getFormattedShortcutsReactive();

  export function updateShortcut(action: string, index: number, event: KeyboardEvent) {
    const combo: ShortcutCombo | null = ShortcutCombo.fromEvent(event);
    if (!combo) return;

    shortcutsRegistry.updateActionShortcut(action as ShortcutAction, index, combo);
    shortcutsRegistry.persistShortcuts();
  }

  export function addShortcut(action: string, event: KeyboardEvent) {
    const combo: ShortcutCombo | null = ShortcutCombo.fromEvent(event);
    if (!combo) return;

    shortcutsRegistry.addActionShortcut(action as ShortcutAction, combo);
    // Defocus the button
    (event.target as HTMLButtonElement).blur();
    shortcutsRegistry.persistShortcuts();
  }

  function removeShortcutHotkey(action: ShortcutAction, index: number) {
    shortcutsRegistry.removeShortcutHotkey(action, index);
    shortcutsRegistry.persistShortcuts();
  }
</script>

<!---------------------- Settings Container ---------------------->
<div class="container flex flex-col space-y-3 overflow-y-auto p-10">
  {#each $shortcuts as { id, title, value } (id)}
    <div class="flex items-center border-b border-zinc-600 pb-3">
      <span class="text-normal text-zinc-300">{title}</span>

      <div class="ml-auto flex items-center space-x-2">
        {#each value as hotkey, index (hotkey)}
          <span
            class="flex flex-nowrap items-center rounded-md bg-zinc-700 px-2 text-sm text-zinc-300 shadow-inner"
          >
            {hotkey}
            <span
              class="group ml-1 rounded-full hover:bg-red-400"
              title="Delete hotkey"
              on:click="{() => removeShortcutHotkey(id, index)}"
              on:keydown="{null}"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-4 w-4 stroke-zinc-500 group-hover:stroke-zinc-900"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </span>
          </span>
        {:else}
          <span class="text-sm text-zinc-300 bg-zinc-700 px-1 rounded-sm shadow-inner">Blank</span>
        {/each}

        <button
          class="group flex h-6 w-6 items-center justify-center rounded-md border-none outline-none transition duration-500 ease-in-out hover:bg-rose-500 focus:outline-none"
          title="Add hotkey"
          aria-label="Add hotkey"
          on:keydown|stopPropagation|preventDefault="{(event) => addShortcut(id, event)}"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-5 w-5 stroke-zinc-400 transition duration-500 ease-in-out group-hover:stroke-zinc-900"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>
      </div>
    </div>
  {/each}
</div>

<style lang="postcss">
  /* Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 14px;
    margin: 0;
  }

  *::-webkit-scrollbar-thumb {
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    border-radius: 9999px;
    background-color: #52525b;
  }
</style>
