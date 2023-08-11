import { PluginContextBuilder } from "./PluginContextBuilder";

import {
  TileUIComponent,
  TileUILeaf,
  TileUIParent,
  type UIComponentProps,
  type UIComponentConfig,
} from "../../../../shared/ui/TileUITypes";

type PartialTile = {
  name: string;
  plugin: string;
  displayName: string;
  description: string;
  icon: string;
  ui: TileUIParent | null;
  uiConfigs: { [key: string]: UIComponentConfig };
};

export class TileBuilder implements PluginContextBuilder {
  private partialTile: PartialTile;

  constructor(plugin: string, name: string) {
    this.partialTile = {
      name,
      plugin,
      displayName: name,
      description: "",
      icon: "",
      ui: null,
      uiConfigs: {},
    };
  }

  get build(): any {
    return null;
  }
  public reset(): void {
    return;
  }

  // TODO: Implement all of these
  public addTitle(): void {
    return;
  }
  public addDescription(): void {
    return;
  }
  public addIcon(): void {
    return;
  }
  public addUIElement(): void {
    return;
  }
}

export class UIElementBuilder implements PluginContextBuilder {
  get build(): any {
    return null;
  }
  public reset(): void {
    return;
  }

  public addButton(): void {
    return;
  }
  public addListBox(): void {
    return;
  }
  public addSlider(): void {
    return;
  }
  public addToggle(): void {
    return;
  }
  public addColorPicker(): void {
    return;
  }
  public addDropdown(): void {
    return;
  }
  public addLayerList(): void {
    return;
  }
}

enum TileUIElementType {
  button,
  listBox,
  slider,
  toggle,
  colorPicker,
  dropdown,
  layerList,
}

// These will be nestable
class TileUIElement {
  constructor(
    private readonly title: string,
    private readonly description: string,
    private readonly icon: string,
    private readonly type: TileUIElementType
  ) {}
}
