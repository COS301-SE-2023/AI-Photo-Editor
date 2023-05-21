export interface PaletteStore {
  isVisible: boolean;
  textInput: string;
  selectedCategoryIndex: number;
  selectedItemIndex: number;
  categories: PaletteCategory[];
  results: PaletteCategory[];
}

export type PaletteItem = {
  title: string;
};

export type PaletteCategory = {
  title: string;
  items: PaletteItem[];
};

export interface GraphNode {
  id: string;
  title: string;
}
