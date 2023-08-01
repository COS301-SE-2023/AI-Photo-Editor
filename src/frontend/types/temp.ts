type QueryInterface = (query: string, args: any, callback: (result: any) => void) => void;

export type Api = {
  commandRegistry: QueryInterface;
  tileRegistry: QueryInterface;
  toolboxRegistry: QueryInterface;
};

declare global {
  interface Window {
    api: Api;
  }
}

// TODO: Replace these with better representations and move to respective Svelte store files
export interface GraphStore {
  nodes: GraphNode[];
}

export interface GraphNode {
  id: string;
  name: string;
  slider: GraphSlider | null;
  connection: string;
}

export interface GraphSlider {
  min: number;
  max: number;
  step: number;
  fixed: number;
  value: number;
}
export interface PaletteStore {
  isVisible: boolean;
  textInput: string;
  selectedCategoryIndex: number;
  selectedItemIndex: number;
  categories: PaletteCategory[];
  results: PaletteCategory[];
  src: "";
}

export type Command = {
  title: string;
};

export type PaletteCategory = {
  title: string;
  items: Command[];
};

export type Shortcut = {
  name: string;
  keys: string[];
};
