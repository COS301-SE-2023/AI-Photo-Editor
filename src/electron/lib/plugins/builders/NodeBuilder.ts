import { type PluginContextBuilder } from "./PluginContextBuilder";
import { NodeInstance } from "../../core-graph/ToolboxRegistry";

export class NodeBuilder implements PluginContextBuilder {
  constructor(private node: NodeInstance) {}

  public validate(): void {
    if (this.node.getSignature === "") {
      throw new Error("Node is not instantiated");
    }
    return;
  }

  get build(): any {
    return null;
  }

  // public reset(): void {
  //   return;
  // }

  // TODO: Implement all of these
  public setTitle(title: string): void {
    this.node.setTitle(title);
  }
  public setDescription(description: string): void {
    this.node.setDescription(description);
  }

  public instantiate(plugin: string, name: string): void {
    this.node.instantiate(plugin, name);
  }

  public addIcon(icon: string): void {
    this.node.setIcon(icon);
  }

  // public addInput(type : string): void {
  //   return;
  // }

  // public addOutput(type : string): void {
  //   return;
  // }

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
