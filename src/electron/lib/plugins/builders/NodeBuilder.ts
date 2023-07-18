import { type PluginContextBuilder } from "./PluginContextBuilder";
import { type MinAnchor, type NodeFunc, NodeInstance } from "../../registries/ToolboxRegistry";
import { NodeUIComponent, NodeUILeaf, NodeUIParent } from "../../../../shared/ui/NodeUITypes";

type PartialNode = {
  name: string;
  plugin: string;
  displayName: string;
  description: string;
  icon: string;
  inputs: MinAnchor[];
  outputs: MinAnchor[];
  ui: NodeUIParent | null;
  func: NodeFunc;
};

// TODO: Verification must be done in all these setter functions
//       that the type expected at runtime is what's actually being received.
//       See: [https://stackoverflow.com/a/44078574] / (Runtime type checking)
export class NodeBuilder implements PluginContextBuilder {
  private partialNode: PartialNode;

  constructor(plugin: string, name: string) {
    this.partialNode = {
      name,
      plugin,
      displayName: "",
      description: "",
      icon: "",
      inputs: [],
      outputs: [],
      ui: null,
      func: () => null,
    };
  }

  get build(): NodeInstance {
    return new NodeInstance(
      this.partialNode.name,
      this.partialNode.plugin,
      this.partialNode.displayName,
      this.partialNode.description,
      this.partialNode.icon,
      this.partialNode.inputs,
      this.partialNode.outputs,
      this.partialNode.func,
      this.partialNode.ui
    );
  }

  public setTitle(title: string): void {
    this.partialNode.displayName = title;
  }

  public setDescription(description: string): void {
    this.partialNode.description = description;
  }

  public addIcon(icon: string): void {
    this.partialNode.icon = icon;
  }

  public addInput(type: string, identifier: string, displayName: string): void {
    this.partialNode.inputs.push({ type, identifier, displayName });
  }

  public addOutput(type: string, identifier: string, displayName: string): void {
    this.partialNode.outputs.push({ type, identifier, displayName });
  }

  public createUIBuilder(): NodeUIBuilder {
    const builder = new NodeUIBuilder();

    // if (this.ui == null) this.ui = node; // set root node automatically
    return builder;
  }

  public define(code: NodeFunc) {
    this.partialNode.func = code;
  }

  public setUI(ui: NodeUIBuilder) {
    this.partialNode.ui = ui.getUI();
  }
}

export class NodeUIBuilder {
  private node: NodeUIParent;

  constructor() {
    this.node = new NodeUIParent("", null);
  }

  public addButton(label: string, param: any): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.Button, label, [param]));
    return this;
  }

  public addSlider(
    label: string,
    min: number,
    max: number,
    step: number,
    defautlVal: number
  ): NodeUIBuilder {
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.Slider, label, [min, max, step, defautlVal])
    );

    return this;
  }

  public addDropdown(label: string, builder: NodeUIBuilder): NodeUIBuilder {
    builder.node.label = label;
    builder.node.parent = this.node;
    this.node.params.push(builder.node);
    return this;
  }

  public addNumberInput(label: string): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.NumberInput, label, []));
    return this;
  }

  public addImageInput(label: string): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.FilePicker, label, []));
    return this;
  }

  // We need to discuss how to handle color pickers
  public addColorPicker(label: string, param: any): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.ColorPicker, label, [param]));
    return this;
  }

  // This needs to get sandboxed! Cant allow user access to getUI
  public getUI() {
    return this.node;
  }

  public addLabel(label: string, param: string) {
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.Label, label, [param]));
    return this;
  }
}
