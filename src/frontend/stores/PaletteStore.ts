import { writable } from "svelte/store";
import type { PaletteStore } from "../types";

export const paletteStore = writable<PaletteStore>({
  isVisible: false,
  textInput: "",
  selectedCategoryIndex: 0,
  selectedItemIndex: 0,
  categories: [],
  results: [],
});
