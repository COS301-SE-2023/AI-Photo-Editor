import { type PluginContextBuilder } from "./PluginContextBuilder";
import { NodeInstance } from "../../registries/ToolboxRegistry";
import { NodeUIComponent, NodeUILeaf, NodeUIParent } from "../../../../shared/ui/NodeUITypes";

/**
 *
 * Builds a node through restricted interface
 * @param node NodeInstance
 *
 * */
export class NodeBuilder implements PluginContextBuilder {
  constructor(node: NodeInstance) {
    this.node = node;
    this.ui = null;
  }

  private node: NodeInstance;
  private ui: NodeUIParent | null;

  /**
   * Ensures that nodeui and is instantiated
   * @throws Error if node is not instantiated
   *
   */
  // This might be redundant, should look into it
  public validate(): void {
    if (this.node.getSignature === "" || this.node.getSignature === null) {
      throw new Error("Node is not instantiated");
    }

    if (this.ui != null) {
      this.node.setUI(this.ui);
    }
    return;
  }

  // Why do users need this?
  get build(): any {
    return null;
  }

  /**
   *
   * @param title Title of the node
   *
   * */

  public setTitle(title: string): void {
    this.node.setTitle(title);
  }

  public setDescription(description: string): void {
    this.node.setDescription(description);
  }

  /**
   *
   * @param plugin Plugin name
   * @param name Unique name for the node
   * @throws Error if plugin or name is not instantiated
   * */

  public instantiate(plugin: string, name: string): void {
    if (plugin === "" || name === "") {
      throw new Error("Plugin or name is not instantiated");
    }

    this.node.instantiate(plugin, name);
  }

  /**
   *
   * @param icon Icon to be displayed on the node
   *
   */

  public addIcon(icon: string): void {
    this.node.setIcon(icon);
  }

  /**
   * @param type type of input
   * @param identifier  Unique identifier for the node
   * @param displayName Node name to display
   */

  public addInput(type: string, identifier: string, displayName: string): void {
    this.node.addInput(type, identifier, displayName);
  }

  /**
   *
   * @param type type of output
   * @param identifier  Unique identifier for the node
   * @param displayName Node name to display
   */

  public addOutput(type: string, identifier: string, displayName: string): void {
    this.node.addOutput(type, identifier, displayName);
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

  /**
   * This function is used to define the functionality of the node
   * @param code This is the code that will be executed when the node is called
   *
   * */

  public define(code: any) {
    this.node.setFunction(code);
  }

  /**
   *
   * Sets the nodeUIBuilder for the node
   * @param ui NodeUIBuilder that will be used to build the UI
   * */

  public setUI(ui: NodeUIBuilder) {
    this.ui = ui.getUI();
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

  /**
   *
   * @param label Label for the button
   * @param param Parameter for the button
   * @returns callback to this NodeUIBuilder
   * */

  public addButton(label: string, param: any): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(NodeUIComponent.Button, label, [param], this.node));
    return this;
  }

  /**
   *
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
      new NodeUILeaf(NodeUIComponent.Slider, label, [min, max, step, defautlVal], this.node)
    );

    return this;
  }

  /**
   *
   * @param label Label for the dropdown
   * @param builder NodeUIBuilder for the dropdown
   * @returns callback to this NodeUIBuilder
   *
   * */

  public addDropdown(label: string, builder: NodeUIBuilder): NodeUIBuilder {
    builder.node.label = label;
    builder.node.parent = this.node;
    this.node.params.push(builder.node);
    return this;
  }

  /**
   *
   * @param label Label for the text input
   * @returns callback to this NodeUIBuilder
   *
   * */

  public addNumberInput(label: string): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(NodeUIComponent.NumberInput, label, [], this.node));
    return this;
  }

  /**
   *
   * @param label Label for the text input
   * @returns callback to this NodeUIBuilder
   *
   * */

  public addImageInput(label: string): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(NodeUIComponent.FilePicker, label, [], this.node));
    return this;
  }

  /**
   *
   * @param label Label for the text input
   * @returns callback to this NodeUIBuilder
   *
   * */

  // We need to discuss how to handle color pickers
  public addColorPicker(label: string, param: any): NodeUIBuilder {
    this.node.params.push(new NodeUILeaf(NodeUIComponent.ColorPicker, label, [param], this.node));
    return this;
  }

  // This needs to get sandboxed! Cant allow user access to getUI
  public getUI() {
    return this.node;
  }

  /**
   *
   * @param label Label for the text input
   * @param param Parameter for the text input
   * @returns callback to this NodeUIBuilder
   *
   * */

  public addLabel(label: string, param: string) {
    this.node.params.push(new NodeUILeaf(NodeUIComponent.Label, label, [param], this.node));
    return this;
  }
}
