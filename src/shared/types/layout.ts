export type LayoutPanel =
  | {
      panels: LayoutPanel[];
      split: number[];
    }
  | {
      content: PanelType;
    };

export type PanelType =
  | "graph"
  | "media"
  | "debug"
  | "webview"
  | "shortcutSettings"
  | "assets"
  | "browser"
  | "webcamera";
