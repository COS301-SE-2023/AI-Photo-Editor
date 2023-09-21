export const userSettingSections = [
  {
    id: "general",
    title: "General",
    categories: [
      { id: "about", title: "About" },
      { id: "ai", title: "AI Settings" },
      { id: "hotkeys", title: "Hotkeys" },
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

export interface UserSetting {
  id: string;
  title: string;
  subtitle?: string;
  secret?: boolean;
}

export interface InputSetting extends UserSetting {
  type: "password" | "text";
  placeholder?: string;
  value: string;
}

export interface DropdownSetting extends UserSetting {
  type: "dropdown";
  options: string[];
  value: string;
}
export interface ToggleSetting extends UserSetting {
  type: "toggle";
  value: boolean;
}

export interface KeyboardShortcuts extends UserSetting {
  id: "keyboardShortcuts";
  type: "keyboardShortcuts";
  value: KeyboardShortcut[];
}
export interface KeyboardShortcut extends UserSetting {
  id: `${string}.${string}`;
  type: "keyboardShortcut";
  value: string[];
}

export type Setting = DropdownSetting | InputSetting | ToggleSetting | KeyboardShortcuts;

type Prettify<T> = T extends object ? { [K in keyof T]: T[K] } : never;

type t = Prettify<KeyboardShortcut>;
