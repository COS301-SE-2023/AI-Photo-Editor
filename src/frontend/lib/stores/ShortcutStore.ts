import type { KeyboardShortcut, KeyboardShortcuts } from "../../../shared/types";
import { derived, writable, get, type Readable } from "svelte/store";

const defaultShortcuts: Omit<KeyboardShortcut, "type">[] = [
  {
    id: "blix.palette.toggle",
    title: "Toggle Command Palette",
    value: ["ctrl+[KeyP]", "meta+[KeyP]"],
  },
  {
    id: "blix.palette.hide",
    title: "Hide Command Palette",
    value: ["[Escape]"],
  },
  {
    id: "blix.palette.scrollDown",
    title: "Scroll Down Command Palette",
    value: ["[ArrowDown]", "ctrl+[KeyJ]"],
  },
  {
    id: "blix.palette.scrollUp",
    title: "Scroll Up Command Palette",
    value: ["[ArrowUp]", "ctrl+[KeyK]"],
  },
  {
    id: "blix.palette.selectItem",
    title: "Select Command Palette Item",
    value: ["[Enter]"],
  },
  {
    id: "blix.palette.prompt",
    title: "Submit Prompt Command Palette",
    value: ["[Tab]"],
  },
  {
    id: "blix.contextMenu.hide",
    title: "Hide Context Menu",
    value: ["[Escape]"],
  },
  {
    id: "blix.contextMenu.scrollDown",
    title: "Scroll Down Context Menu",
    value: ["ctrl+[KeyJ]"],
  },
  {
    id: "blix.contextMenu.scrollUp",
    title: "Scroll Up Context Menu",
    value: ["ctrl+[KeyK]"],
  },
  {
    id: "blix.contextMenu.selectItem",
    title: "Select Context Menu Item",
    value: ["[Enter]"],
  },
  {
    id: "blix.projects.newProject",
    title: "Create New Project",
    value: ["meta+[KeyN]", "ctrl+[KeyN]"],
  },
  {
    id: "blix.settings.toggle",
    title: "Toggle Settings",
    value: ["meta+[Comma]", "ctrl+[Comma]"],
  },
  {
    id: "blix.settings.hide",
    title: "Hide Settings",
    value: ["[Escape]"],
  },
  {
    id: "blix.splash.hide",
    title: "Hide Splash Screen",
    value: ["[Escape]"],
  },
  {
    id: "blix.projects.save",
    title: "Save Project",
    value: ["ctrl+[KeyS]", "meta+[KeyS]"],
  },
];

export type ShortcutAction = `${string}.${string}`; // Actions must be nested at least one layer deep
export type ShortcutString = string;

export class ShortcutCombo {
  keyCode: string;

  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;

  // Codes that cannot be used alone as shortcuts
  static readonly invalidCodes = [
    "ControlLeft",
    "ControlRight",
    "AltLeft",
    "AltRight",
    "ShiftLeft",
    "ShiftRight",
    "MetaLeft",
    "MetaRight",
  ];

  constructor(keyCode: string, ctrl: boolean, alt: boolean, shift: boolean, meta: boolean) {
    this.keyCode = keyCode;
    this.ctrl = ctrl;
    this.alt = alt;
    this.shift = shift;
    this.meta = meta;
  }

  public static cleanString(shortcutString: ShortcutString): ShortcutString {
    return this.fromString(shortcutString).getString;
  }

  // Returns null if the event is not a valid shortcut
  public static fromEvent(event: KeyboardEvent): ShortcutCombo | null {
    if (this.invalidCodes.includes(event.code)) return null;

    return new ShortcutCombo(
      event.code,
      event.ctrlKey,
      event.altKey,
      event.shiftKey,
      event.metaKey
    );
  }

  // Valid shortcut strings:
  // shortcut -> token (+ token)*
  // token -> ctrl | alt | shift | keyCode
  // keyCode -> \[ someKey \]
  public static fromString(shortcutString: ShortcutString): ShortcutCombo {
    const parts = shortcutString.split("+").map((part) => part.trim());

    // TODO: This needs to be made much more sophisticated;
    //       We probably want to implement a basic parser.
    //       For now we just take the first [keyCode] token
    let keyCode = "invalid";
    parts.forEach((part, index) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        keyCode = part.slice(1, -1);
        parts.splice(index, 1);
      }
    });

    return new ShortcutCombo(
      keyCode,
      parts.includes("ctrl"),
      parts.includes("alt"),
      parts.includes("shift"),
      parts.includes("meta")
    );
  }

  public get getString(): ShortcutString {
    return `${this.ctrl ? "ctrl+" : ""}${this.alt ? "alt+" : ""}${this.shift ? "shift+" : ""}${
      this.meta ? "meta+" : ""
    }[${this.keyCode}]`;
  }
}

class ShortcutStore {
  // Gets filled with default shortcuts
  shortcuts = writable<Map<ShortcutAction, KeyboardShortcut>>();

  constructor() {
    this.refreshStore(
      defaultShortcuts.map((shortcut) => ({ ...shortcut, type: "keyboardShortcut" }))
    );
  }

  public refreshStore(keyboardShortcuts: KeyboardShortcut[]) {
    if (keyboardShortcuts.length === 0) {
      return;
    }

    this.shortcuts.set(new Map(keyboardShortcuts.map((shortcut) => [shortcut.id, shortcut])));
  }

  /** Saves user shortcuts to ElectronStore. */
  public async persistShortcuts() {
    const $shortcuts = get(this.shortcuts);
    const shortcutsList = Array.from($shortcuts.values());
    const keyboardShortcuts: KeyboardShortcuts = {
      id: "keyboardShortcuts",
      type: "keyboardShortcuts",
      title: "Keyboard Shortcuts",
      value: shortcutsList,
    };

    return await window.apis.utilApi.saveUserSetting(keyboardShortcuts);
  }

  public addActionShortcut(action: ShortcutAction, combo: ShortcutCombo) {
    this.shortcuts.update((shortcuts) => {
      const shortcut = shortcuts.get(action);

      if (!shortcut) {
        shortcuts.set(action, { id: action, title: "", value: [], type: "keyboardShortcut" });
      } else {
        shortcuts.set(action, { ...shortcut, value: [...shortcut.value, combo.getString] });
      }

      return shortcuts;
    });
  }

  /** Removes a specific keybind from an action/command. */
  public removeShortcutHotkey(action: ShortcutAction, index: number) {
    this.shortcuts.update((shortcuts) => {
      const shortcut = shortcuts.get(action);

      if (!shortcut) {
        return shortcuts;
      }

      const keys = [...shortcut.value];
      keys.splice(index, 1);
      shortcuts.set(action, { ...shortcut, value: keys });

      return shortcuts;
    });
  }

  public updateActionShortcut(action: ShortcutAction, index: number, combo: ShortcutCombo) {
    this.shortcuts.update((shortcuts) => {
      const shortcut = shortcuts.get(action);

      if (!shortcut) {
        shortcuts.set(action, { id: action, title: "", value: [], type: "keyboardShortcut" });
        return shortcuts;
      }

      if (shortcut.value.length <= index) {
        shortcuts.set(action, { ...shortcut, value: [...shortcut.value, combo.getString] });
      } else {
        const keys = [...shortcut.value];
        keys[index] = combo.getString;
        shortcuts.set(action, { ...shortcut, value: keys });
      }

      return shortcuts;
    });
  }

  public getShortcutsForAction(action: ShortcutAction): ShortcutString[] {
    const $shortcuts = get(this.shortcuts);
    const shortcut = $shortcuts.get(action);

    if (!shortcut) {
      return [];
    }

    return shortcut.value;
  }

  /** Returns a derived store that only listens for a specified action */
  public getShortcutsForActionReactive(action: ShortcutAction): Readable<ShortcutString[]> {
    return derived(this.shortcuts, ($shortcuts) => {
      const shortcut = $shortcuts.get(action);

      if (!shortcut) {
        return [];
      }

      return shortcut.value;
    });
  }

  public getShortcutsReactive(): Readable<KeyboardShortcut[]> {
    return derived(this.shortcuts, ($shortcuts) => {
      return Array.from($shortcuts.values());
    });
  }

  public getFormattedShortcutsReactive(): Readable<KeyboardShortcut[]> {
    return derived(this.shortcuts, ($shortcuts) => {
      const shortcuts = Array.from($shortcuts.values()).map((shortcut) => ({ ...shortcut }));

      shortcuts.forEach((shortcut) => {
        shortcut.value = shortcut.value.map((combo) => {
          const map = new Map<string | RegExp, string>([
            ["Comma", ","],
            ["Equal", "="],
            ["Minus", "-"],
            ["Period", "."],
            ["Backslash", "\\"],
            ["Backspace", "⌫"],
            ["meta", "⌘"],
            ["alt", "⌥"],
            ["ctrl", "⌃"],
            ["shift", "⇧"],
            ["ArrowDown", "↓"],
            ["ArrowUp", "↑"],
            ["ArrowLeft", "←"],
            ["ArrowRight", "→"],
            ["BracketRight", "]"],
            ["BracketLeft", "["],
            ["Digit", ""],
            ["Key", ""],
            ["[", ""],
            ["]", ""],
            [/\+/g, " "],
          ]);

          for (const [key, value] of map.entries()) {
            combo = combo.replace(key, value);
          }

          return combo;
        });

        return shortcut;
      });

      return shortcuts;
    });
  }

  public checkShortcut(action: ShortcutAction, combo: ShortcutCombo): boolean {
    if (!combo) return false;

    return this.getShortcutsForAction(action).includes(combo.getString);
  }

  public get subscribe() {
    return this.shortcuts.subscribe;
  }
}

export const shortcutsRegistry = new ShortcutStore();
