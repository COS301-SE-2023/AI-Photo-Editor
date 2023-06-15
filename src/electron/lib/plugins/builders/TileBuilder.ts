import { PluginContextBuilder } from "./PluginContextBuilder";

export class TileBuilder implements PluginContextBuilder {
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
