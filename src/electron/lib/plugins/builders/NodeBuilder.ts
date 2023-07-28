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
      displayName: name,
      description: "",
      icon: "",
      inputs: [],
      outputs: [],
      ui: null,
      func: () => ({}),
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

  /**
   *
   * @param title Title of the node
   *
   * */

  public setTitle(title: string): void {
    this.partialNode.displayName = title;
  }

  public setDescription(description: string): void {
    this.partialNode.description = description;
  }

  /**
   *
   * @param icon Icon to be displayed on the node
   *
   */

  public addIcon(icon: string): void {
    this.partialNode.icon = icon;
  }

  /**
   * @param type type of input
   * @param identifier  Unique identifier for the node
   * @param displayName Node name to display
   */

  public addInput(type: string, identifier: string, displayName: string): void {
    this.partialNode.inputs.push({ type, identifier, displayName });
  }

  /**
   *
   * @param type type of output
   * @param identifier  Unique identifier for the node
   * @param displayName Node name to display
   */

  public addOutput(type: string, identifier: string, displayName: string): void {
    this.partialNode.outputs.push({ type, identifier, displayName });
  }

  /**
   * Creates a new nodeUIBuilder for the node
   * @returns NodeUIBuilder
   */

  public createUIBuilder(): NodeUIBuilder {
    const builder = new NodeUIBuilder();

    // if (this.ui == null) this.ui = node; // set root node automatically
    return builder;
  }

  public define(code: NodeFunc) {
    this.partialNode.func = code;
  }

  /**
   *
   * Sets the nodeUIBuilder for the node
   * @param ui NodeUIBuilder that will be used to build the UI
   * */

  public setUI(ui: NodeUIBuilder) {
    this.partialNode.ui = ui.getUI();
  }
}

/**
 *
 * Builds the nodes's ui through restricted interface
 *
 * */

export class NodeUIBuilder {
  private node: NodeUIParent;

  constructor() {
    this.node = new NodeUIParent("", null);
  }

  public addKnob(
    label: string,
    min: number,
    max: number,
    step: number,
    defautlVal: number
  ): NodeUIBuilder {
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.Knob, label, [min, max, step, defautlVal])
    );

    return this;
  }

  /**
   * @param label Label for the button
   * @param param Parameter for the button
   * @returns callback to this NodeUIBuilder
   * */
  public addButton(label: string, param: any): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.Button, label, [param]));
    return this;
  }

  /**
   * @param label Label for the slider
   * @param min Minimum value for the slider
   * @param max Maximum value for the slider
   * @param step Change in value for the slider
   * @param defautlVal Default value
   * @returns callback to this NodeUIBuilder
   */
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

  public addDropdown(
    label: string,
    options: { [key: string]: any },
    defaultOption: string
  ): NodeUIBuilder {
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.Dropdown, label, [options, defaultOption])
    );
    return this;
  }

  /**
   * @param label Label for the accordion
   * @param builder NodeUIBuilder for the accordion
   * @returns callback to this NodeUIBuilder
   * */

  public addAccordion(label: string, builder: NodeUIBuilder): NodeUIBuilder {
    builder.node.label = label;
    builder.node.parent = this.node;
    this.node.params.push(builder.node);
    return this;
  }

  /**
   * @param label Label for the text input
   * @returns callback to this NodeUIBuilder
   * */
  public addNumberInput(label: string): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.NumberInput, label, []));
    return this;
  }

  /**
   * @param label Label for the text input
   * @returns callback to this NodeUIBuilder
   * */
  public addImageInput(label: string): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.FilePicker, label, []));
    return this;
  }

  /**
   * @param label Label for the text input
   * @returns callback to this NodeUIBuilder
   * */
  // We need to discuss how to handle color pickers
  public addColorPicker(label: string, param: any): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.ColorPicker, label, [param]));
    return this;
  }

  // This needs to get sandboxed! Cant allow user access to getUI
  public getUI() {
    return this.node;
  }

  /**
   * @param label Label for the text input
   * @param param Parameter for the text input
   * @returns callback to this NodeUIBuilder
   * */
  public addLabel(label: string, param: string) {
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.Label, label, [param]));
    return this;
  }
}
