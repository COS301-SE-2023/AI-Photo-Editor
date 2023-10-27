export const userSettingSections = [
  {
    id: "general",
    title: "General",
    categories: [
      { id: "about", title: "About" },
      { id: "ai", title: "AI Settings" },
      { id: "hotkeys", title: "Hotkeys" },
      { id: "plugin_browser", title: "Plugin Browser" },
    ],
  },
] as const satisfies readonly UserSettingsSection[];

export type UserSettingsCategoryId =
  (typeof userSettingSections)[number]["categories"][number]["id"];

export type UserSettingsCategoryTitle =
  (typeof userSettingSections)[number]["categories"][number]["title"];

export type UserSettingsSection = {
  id: string;
  title: string;
  categories: ReadonlyArray<UserSettingCategory>;
};

export type UserSettingCategory = {
  id: string;
  title: string;
  subtitle?: string;
};

export type Setting = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string[];
  components: SettingComponent[];
};

interface SettingComponentBase {
  id: string;
  secret?: boolean;
}

export interface Input extends SettingComponentBase {
  type: "secret" | "text";
  placeholder?: string;
  value: string;
}

export interface Dropdown extends SettingComponentBase {
  type: "dropdown";
  options: string[];
  value: string;
}
export interface Toggle extends SettingComponentBase {
  type: "toggle";
  value: boolean;
}
export interface Button extends SettingComponentBase {
  type: "button";
  value: string;
  onClick: (item: Button) => void;
}

export interface ColorPicker extends SettingComponentBase {
  type: "colorPicker";
  value: `#${string}`;
}

export interface KeyboardShortcuts extends SettingComponentBase {
  id: "keyboardShortcuts";
  type: "keyboardShortcuts";
  value: KeyboardShortcut[];
}
export interface KeyboardShortcut extends SettingComponentBase {
  id: `${string}.${string}`;
  title: string;
  type: "keyboardShortcut";
  value: string[];
}

export type SettingComponent = Dropdown | Input | Toggle | KeyboardShortcuts | Button | ColorPicker;

type Prettify<T> = T extends object ? { [K in keyof T]: T[K] } : never;

type t = Prettify<KeyboardShortcut>;
