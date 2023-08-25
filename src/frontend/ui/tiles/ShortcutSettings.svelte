<script lang="ts">
  import {
    shortcutsRegistry,
    type ShortcutAction,
    ShortcutCombo,
  } from "@frontend/lib/stores/ShortcutStore";
  import { get } from "svelte/store";

  export const shortcuts: { [key: string]: string[] } = get(shortcutsRegistry.shortcuts);

  export function updateShortcut(action: string, index: number, event: KeyboardEvent) {
    console.log(action, event);
    const combo: ShortcutCombo | null = ShortcutCombo.fromEvent(event);
    if (!combo) return;

    shortcutsRegistry.updateActionShortcut(action as ShortcutAction, index, combo);
  }

  export function addShortcut(action: string, event: KeyboardEvent) {
    const combo: ShortcutCombo | null = ShortcutCombo.fromEvent(event);
    if (!combo) return;

    shortcutsRegistry.addActionShortcut(action as ShortcutAction, combo);
    // Defocus the button
    (event.target as HTMLButtonElement).blur();
  }
</script>

<div class="content">
  <b style="color: aliceblue;">Keyboard Shortcuts Settings</b>
  <h6 style="color: aliceblue">Configure your shortcut preferences here</h6>
  <table class="shortcutsTable">
    {#each Object.entries($shortcutsRegistry) as [action, shortcuts]}
      <tr>
        <td>
          {action}
        </td>
        {#each shortcuts as shortcut, index}
          <td>
            <button
              on:keydown|stopPropagation|preventDefault="{(event) =>
                updateShortcut(action, index, event)}"
            >
              {shortcut}
            </button>
          </td>
        {/each}
        <td>
          <button
            class="addShortcut"
            on:keydown|stopPropagation|preventDefault="{(event) => addShortcut(action, event)}"
          >
            +
          </button>
        </td>
      </tr>
    {/each}
  </table>
</div>

<style>
  .content {
    width: 100%;
    height: 75%;
    padding: 1em;
  }
  .shortcutsTable {
    margin-top: 2em;
    background-color: rgba(82, 82, 91, 0.705);
    opacity: 0.8;
    border-spacing: 10px;
  }
  .shortcutsTable tr {
    border: 2px solid #32324b;
    border-radius: 1px;
    border-spacing: 5px;
  }
  .shortcutsTable td {
    padding-right: 0.5em;
    text-align: center;
    color: rgba(240, 248, 255, 0.952);
  }
  .shortcutsTable button {
    border: none;
    width: 10em;
    background: #11111b;
  }
  .addShortcut {
    max-width: 2em;
  }
  .shortcutsTable button:hover {
    background-color: #1c1c2c;
  }
</style>
