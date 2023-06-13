// TODO: Scrap & Replace this
export interface PaletteStore {
  isVisible: boolean;
  textInput: string;
  selectedCategoryIndex: number;
  selectedItemIndex: number;
  categories: PaletteCategory[];
  results: PaletteCategory[];
  src: "";
}

export type PaletteItem = {
  title: string;
};

export type PaletteCategory = {
  title: string;
  items: PaletteItem[];
};
