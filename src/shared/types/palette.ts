export type PaletteView = {
  searchPlaceholder: string;
  searchValue?: string;
  content: ContentTypes;
};

export type ContentTypes = PaletteList | PaletteForm;

export interface PaletteForm {
  type: "form";
  items: string[];
}

export interface PaletteList {
  type: "list";
  sections: PaletteListSection[];
  filteredSections?: PaletteListSection[];
}

export type PaletteListSection = {
  title: string;
  items: PaletteListItem[];
};

export type PaletteListItem = {
  title: string;
  subtitle?: string;
  icon?: string;
  props?: PaletteListProp[];
  command?: PaletteCommand;
};

export type PaletteCommand = {
  id: string;
  args?: Record<string, any>;
};

export type PaletteListProp = {
  text?: string;
  icon?: string;
  keybind?: string;
  // Add other props here
};
