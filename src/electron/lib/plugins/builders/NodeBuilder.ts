import { type PluginContextBuilder } from "./PluginContextBuilder";
import {
  type MinAnchor,
  type NodeFunc,
  NodeInstance,
  type NodeUIInitializer,
} from "../../registries/ToolboxRegistry";
import {
  NodeUIComponent,
  NodeUILeaf,
  NodeUIParent,
  type UIComponentProps,
  type UIComponentConfig,
} from "../../../../shared/ui/NodeUITypes";
import { type NodeTweakData } from "../../../../shared/types";

type PartialNode = {
  name: string;
  plugin: string;
  displayName: string;
  description: string;
  icon: string;
  inputs: MinAnchor[];
  outputs: MinAnchor[];
  ui: NodeUIParent | null;
  uiConfigs: { [key: string]: UIComponentConfig };
  func: NodeFunc;
  uiInitializer: NodeUIInitializer;
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
      uiConfigs: {},
      func: () => ({}),
      uiInitializer: (x) => x,
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
      this.partialNode.ui,
      this.partialNode.uiConfigs,
      this.partialNode.uiInitializer
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

  public setUIInitializer(uiInitializer: NodeUIInitializer): void {
    this.partialNode.uiInitializer = uiInitializer;
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
    this.partialNode.uiConfigs = ui.getUIConfigs();
  }
}

function getRandomComponentId(type: NodeUIComponent) {
  return `${type.toString()}-${Math.floor(Math.random() * 16 ** 6).toString(16)}`;
}

/**
 *
 * Builds the nodes's ui through restricted interface
 *
 * */

export class NodeUIBuilder {
  private node: NodeUIParent;
  private uiConfigs: { [key: string]: UIComponentConfig };

  constructor() {
    this.node = new NodeUIParent("", null);
    this.uiConfigs = {};
  }

  public addBuffer(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.Buffer);
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.Buffer, componentId, [props]));
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? {},
      triggerUpdate: config.triggerUpdate ?? true,
    };

    return this;
  }
  public addCachePicker(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.CachePicker);
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.CachePicker, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? 0,
      triggerUpdate: config.triggerUpdate ?? true,
    };
    return this;
  }

  // This dial enables plugins to access the current node's UUID, as well as a list of uiInputs id's.
  // This can then be used in coordination with the webview Tweaks API to modify node UI inputs.
  public addTweakDial(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.TweakDial);
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.TweakDial, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? ({ nodeUUID: "", inputs: [] } as NodeTweakData),
      triggerUpdate: config.triggerUpdate ?? true,
    };

    return this;
  }

  // This dial provides the node a list of properties that changed in the last UI update
  public addDiffDial(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.DiffDial);
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.DiffDial, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? { changes: [] as string[] },
      triggerUpdate: config.triggerUpdate ?? true,
    };

    return this;
  }

  public addKnob(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.Knob);
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.Knob, componentId, [props]));
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? 0,
      triggerUpdate: config.triggerUpdate ?? true,
    };
    return this;
  }

  /**
   * @param label Label for the button
   * @param param Parameter for the button
   * @returns callback to this NodeUIBuilder
   * */
  public addButton(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.Button);
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.Button, componentId, [props]));
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? "",
      triggerUpdate: config.triggerUpdate ?? false,
    };
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
  public addSlider(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.Slider);
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.Slider, componentId, [props]));
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? 0,
      triggerUpdate: config.triggerUpdate ?? true,
    };

    return this;
  }

  public addDropdown(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.Dropdown);
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.Dropdown, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? (props.options ? Object.keys(props.options)[0] : "null"),
      triggerUpdate: config.triggerUpdate ?? true,
    };
    return this;
  }

  public addRadio(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.Radio);
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.Radio, componentId, [props]));
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? (props.options ? Object.keys(props.options)[0] : "null"),
      triggerUpdate: config.triggerUpdate ?? true,
    };
    return this;
  }

  /**
   * @param label Label for the accordion
   * @param builder NodeUIBuilder for the accordion
   * @returns callback to this NodeUIBuilder
   * */

  public addAccordion(config: UIComponentConfig, builder: NodeUIBuilder): NodeUIBuilder {
    builder.node.label = config.label;
    builder.node.parent = this.node;
    this.node.params.push(builder.node);
    return this;
  }

  /**
   * @param label Label for the text input
   * @returns callback to this NodeUIBuilder
   * */
  public addFilePicker(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.FilePicker);
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.FilePicker, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? "",
      triggerUpdate: config.triggerUpdate ?? true,
    };
    return this;
  }

  /**
   * @param label Label for the text input
   * @returns callback to this NodeUIBuilder
   * */
  public addTextInput(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.TextInput);
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.TextInput, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? "empty",
      triggerUpdate: config.triggerUpdate ?? true,
    };
    return this;
  }

  /**
   * @param label Label for the text input
   * @returns callback to this NodeUIBuilder
   * */
  public addNumberInput(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.NumberInput);
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.NumberInput, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? 0,
      triggerUpdate: config.triggerUpdate ?? true,
    };
    return this;
  }

  /**
   * @param label Label for the text input
   * @returns callback to this NodeUIBuilder
   * */
  // TODO: Remove duplicate, we already have addFilePicker()
  public addImageInput(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.FilePicker);
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.FilePicker, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? "",
      triggerUpdate: config.triggerUpdate ?? true,
    };
    return this;
  }

  /**
   * @param label Label for the text input
   * @returns callback to this NodeUIBuilder
   * */
  // We need to discuss how to handle color pickers
  public addColorPicker(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.ColorPicker);
    this.node.params.push(
      new NodeUILeaf(this.node, NodeUIComponent.ColorPicker, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? "#000000",
      triggerUpdate: config.triggerUpdate ?? true,
    };
    return this;
  }

  // This needs to get sandboxed! Cant allow user access to getUI
  public getUI() {
    return this.node;
  }

  public getUIConfigs() {
    return this.uiConfigs;
  }

  /**
   * @param label Label for the text input
   * @props props Parameter for the text input
   * @returns callback to this NodeUIBuilder
   * */
  public addLabel(config: UIComponentConfig, props: UIComponentProps) {
    const componentId = config.componentId ?? getRandomComponentId(NodeUIComponent.Label);
    this.node.params.push(new NodeUILeaf(this.node, NodeUIComponent.Label, componentId, [props]));
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? "empty",
      triggerUpdate: config.triggerUpdate ?? true,
    };
    return this;
  }
}
