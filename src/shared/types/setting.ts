export interface UserSettingsCategory {
  id: string;
  title: string;
  subtitle?: string;
  settings: Setting[];
}

export interface UserSetting {
  id: string;
  title: string;
  subtitle?: string;
  secret?: boolean;
  type: "dropdown" | "password" | "text" | "toggle";
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

export type Setting = DropdownSetting | InputSetting | ToggleSetting;
