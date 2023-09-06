export interface LayoutPanel {
  panels?: LayoutPanel[];
  content?: PanelType;
}

export type PanelType =
  | "graph"
  | "media"
  | "debug"
  | "webview"
  | "shortcutSettings"
  | "assets"
  | "browser"
  | "webcamera";
