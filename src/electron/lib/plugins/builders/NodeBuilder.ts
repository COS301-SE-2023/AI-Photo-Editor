import { type PluginContextBuilder } from "./PluginContextBuilder";

export class NodeBuilder implements PluginContextBuilder {
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
