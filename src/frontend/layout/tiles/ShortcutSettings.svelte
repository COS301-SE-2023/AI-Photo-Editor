<script lang="ts">
  import { shortcutsRegistry, type ShortcutAction, ShortcutCombo } from "stores/ShortcutStore";

  function updateShortcut(action: string, index: number, event: KeyboardEvent) {
    console.log(action, event);
    shortcutsRegistry.updateActionShortcut(
      action as ShortcutAction,
      index,
      ShortcutCombo.fromEvent(event)
    );
  }

  function addShortcut(action: string, event: KeyboardEvent) {
    shortcutsRegistry.addActionShortcut(action as ShortcutAction, ShortcutCombo.fromEvent(event));
  }
</script>

<div class="content">
  <b>Keyboard Shortcuts Settings</b>
  <h6>Configure your shortcut preferences here</h6>
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
    height: 100%;
    padding: 1em;
  }
  .shortcutsTable {
    margin-top: 2em;
  }
  .shortcutsTable tr {
    border: 1px solid #32324b;
  }
  .shortcutsTable td {
    padding-right: 0.5em;
    text-align: center;
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
