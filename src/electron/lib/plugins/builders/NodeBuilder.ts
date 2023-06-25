import { type PluginContextBuilder } from "./PluginContextBuilder";
import { NodeInstance, NodeUIParent } from "../../core-graph/ToolboxRegistry";

export class NodeBuilder implements PluginContextBuilder {
  constructor(node: NodeInstance) {
    this.node = node;
    this.ui = null;
  }

  private node: NodeInstance;
  private ui: NodeUIParent | null;

  public validate(): void {
    if (this.node.getSignature === "") {
      throw new Error("Node is not instantiated");
    }

    if (this.ui != null) {
      this.node.setUI(this.ui);
    }
    return;
  }

  get build(): any {
    return null;
  }

  public setTitle(title: string): void {
    this.node.setTitle(title);
  }

  public setDescription(description: string): void {
    this.node.setDescription(description);
  }

  public instantiate(plugin: string, name: string): void {
    if (plugin === "" || name === "") {
      throw new Error("Plugin or name is not instantiated");
    }

    this.node.instantiate(plugin, name);
  }

  public addIcon(icon: string): void {
    this.node.setIcon(icon);
  }

  public addInput(type: string, anchorname: string): void {
    this.node.addInput(type, anchorname);
  }

  public addOutput(type: string, anchorname: string): void {
    this.node.addOutput(type, anchorname);
  }

  public createUIBuilder(): NodeUIBuilder {
    const node = new NodeUIParent("", null);
    const builder = new NodeUIBuilder(node);

    if (this.ui == null) this.ui = node; // set root node automatically
    return builder;
  }

  public define(code: any) {
    this.node.setFunction(code);
  }

  public setUI(ui: NodeUIBuilder) {
    this.ui = ui.getUI();
  }
}

export class NodeUIBuilder {
  constructor(private node: NodeUIParent) {}

  public addButton(label: string, param: any): NodeUIBuilder {
    this.node.addButton(label, param);
    return this;
  }

  public addSlider(
    label: string,
    min: number,
    max: number,
    step: number,
    defautlVal: number
  ): NodeUIBuilder {
    this.node.addSlider(label, min, max, step, defautlVal);
    return this;
  }

  public addDropdown(label: string, builder: NodeUIBuilder): NodeUIBuilder {
    this.node.addDropdown(label, builder.node);
    return this;
  }

  public addNumberInput(label: string): NodeUIBuilder {
    this.node.addNumberInput(label);
    return this;
  }

  public addImageInput(label: string): NodeUIBuilder {
    this.node.addImageInput(label);
    return this;
  }

  // We need to discuss how to handle color pickers
  public addColorPicker(label: string, param: any): NodeUIBuilder {
    this.node.addColorPicker(label, param);
    return this;
  }

  // This needs to get sandboxed! Cant allow user access to getUI
  public getUI() {
    return this.node;
  }

  public addLabel(label: string, param: string) {
    this.node.addLabel(label, param);
    return this;
  }
}
