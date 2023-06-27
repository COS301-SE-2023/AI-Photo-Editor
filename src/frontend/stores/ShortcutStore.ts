import { derived, writable, get } from "svelte/store";

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

type ShortcutsDict = { [key: ShortcutAction]: ShortcutString[] };

// Maps actions to their respective shortcuts
class ShortcutStore {
  // Fill default shortcuts here
  shortcuts = writable<ShortcutsDict>({
    "blix.palette.toggle": ["ctrl+[KeyP]", "meta+[KeyP]"],
    "blix.palette.show": [],
    "blix.palette.hide": ["[Escape]"],
    "blix.palette.scrollDown": ["[ArrowDown]", "ctrl+[KeyJ]", "[Tab]"],
    "blix.palette.scrollUp": ["[ArrowUp]", "ctrl+[KeyK]", "shift+[Tab]"],
    "blix.palette.selectItem": ["[Enter]"],
  });

  public addActionShortcut(action: ShortcutAction, combo: ShortcutCombo) {
    this.shortcuts.update((shortcuts) => {
      if (shortcuts[action] === undefined) {
        shortcuts[action] = [];
      }
      shortcuts[action].push(combo.getString);
      return shortcuts;
    });
  }

  public updateActionShortcut(action: ShortcutAction, index: number, combo: ShortcutCombo) {
    this.shortcuts.update((shortcuts) => {
      if (shortcuts[action] === undefined) {
        shortcuts[action] = [];
      }
      if (shortcuts[action].length <= index) {
        shortcuts[action].push(combo.getString);
        return shortcuts;
      }
      shortcuts[action][index] = combo.getString;
      return shortcuts;
    });
  }

  public get subscribe() {
    return this.shortcuts.subscribe;
  }

  public getShortcutsForAction(action: ShortcutAction): ShortcutString[] {
    const sc = get(this.shortcuts);
    if (sc[action] === undefined) {
      return [];
    }
    return sc[action];
  }

  // Returns a derived store that only listens for the specified action
  public getShortcutsForActionReactive(action: ShortcutAction) {
    return derived(this.shortcuts, ($shortcuts) => {
      if ($shortcuts[action] === undefined) {
        return [];
      }
      return $shortcuts[action];
    });
  }

  public checkShortcut(action: ShortcutAction, combo: ShortcutCombo): boolean {
    return this.getShortcutsForAction(action).includes(combo.getString);
  }
}

// export const shortcutsRegistry = writable<ShortcutStore>(new ShortcutStore());
export const shortcutsRegistry = new ShortcutStore();
