import { writable } from "svelte/store";

export type ShortcutAction = `${string}.${string}`; // Actions must be nested at least one layer deep
export type ShortcutString = string;

export class ShortcutCombo {
  keyCode: string;

  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;

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

  public static fromEvent(event: KeyboardEvent): ShortcutCombo {
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

// Maps actions to their respective shortcuts
class ShortcutStore {
  // Fill default shortcuts here
  shortcuts: { [key: ShortcutAction]: ShortcutString[] } = {
    "blix.palette.toggle": ["ctrl+[KeyP]", "meta+[KeyP]"],
    "blix.palette.show": [],
    "blix.palette.hide": ["[Escape]"],
    "blix.palette.scrollDown": ["[ArrowDown]", "ctrl+[KeyJ]", "[Tab]"],
    "blix.palette.scrollUp": ["[ArrowUp]", "ctrl+[KeyK]", "shift+[Tab]"],
    "blix.palette.selectItem": ["[Enter]"],
  };

  public addActionShortcut(action: ShortcutAction, combo: ShortcutCombo) {
    if (this.shortcuts[action] === undefined) {
      this.shortcuts[action] = [];
    }
    this.shortcuts[action].push(combo.getString);
  }

  public getShortcuts(action: ShortcutAction): ShortcutString[] {
    if (this.shortcuts[action] === undefined) {
      return [];
    }
    return this.shortcuts[action];
  }

  public checkShortcut(action: ShortcutAction, combo: ShortcutCombo): boolean {
    return this.getShortcuts(action).includes(combo.getString);
  }
}

export const shortcutsRegistry = writable<ShortcutStore>(new ShortcutStore());
