import type { Registry, RegistryInstance } from "../Registry";
import type { INode, IAnchor } from "../../../shared/types";

export class ToolboxRegistry implements Registry {
  private registry: { [key: string]: NodeInstance } = {};

  addInstance(instance: NodeInstance): void {
    this.registry[instance.getSignature] = instance;
    return;
  }
  getRegistry(): { [key: string]: NodeInstance } {
    return this.registry;
  }
  getNodes(): INode[] {
    const commands: INode[] = [];
    for (const command in this.registry) {
      if (!this.registry.hasOwnProperty(command)) continue;

      const nodeInstance: NodeInstance = this.registry[command];
      // Get anchors
      const inputAnchors: IAnchor[] = [];
      const outputAnchors: IAnchor[] = [];

      // const inputAnchorsInstances = nodeInstance.getInputAnchorInstances;
      // const outputAnchorsInstances = nodeInstance.getInputAnchorInstances;

      for (const anchor of nodeInstance.getInputAnchorInstances) {
        const anchorObject = {
          type: anchor.type,
          signature: anchor.signature,
          displayName: anchor.displayName,
        };
        inputAnchors.push(anchorObject);
      }

      for (const anchor of nodeInstance.getOutputAnchorInstances) {
        const anchorObject = {
          type: anchor.type,
          signature: anchor.signature,
          displayName: anchor.displayName,
        };
        outputAnchors.push(anchorObject);
      }

      const nodeObbject = {
        signature: nodeInstance.getSignature,
        title: nodeInstance.getTitle,
        description: nodeInstance.getDescription,
        icon: nodeInstance.getIcon,
        inputs: inputAnchors,
        outputs: outputAnchors,
        ui: nodeInstance.getUI,
      };
      commands.push(nodeObbject);
    }
    return commands;
  }
}

// This should probably become virtual
export class NodeUI {
  constructor() {
    this.parent = null;
    this.label = "";
    this.params = [];
    this.type = "ui";
  }
  public parent: NodeUI | null;
  public label: string;
  public params: any[];
  public type: string;
}

export class NodeUIParent extends NodeUI {
  constructor(label: string, parent: NodeUIParent | null) {
    super();
    this.label = label;
    this.parent = parent;
    this.params = [];
    this.type = "Parent";
  }

  label: string;
  params: NodeUI[];

  public addButton(label: string, param: string): void {
    this.params.push(new NodeUILeaf("Button", label, [param], this));
  }

  public addSlider(
    label: string,
    min: number,
    max: number,
    step: number,
    defautlVal: number
  ): void {
    this.params.push(new NodeUILeaf("Slider", label, [min, max, step, defautlVal], this));
  }

  public addDropdown(parent: NodeUIParent) {
    this.params.push(parent);
  }

  public addLabel(label: string, param: string) {
    this.params.push(new NodeUILeaf("Label", label, [param], this));
  }

  public addNumberInput(label: string, param: number) {
    this.params.push(new NodeUILeaf("NumberInput", label, [param], this));
  }

  public addImageInput(label: string) {
    this.params.push(new NodeUILeaf("ImageInput", label, [], this));
  }

  public addColorPicker(label: string, param: any) {
    this.params.push(new NodeUILeaf("ColorPicker", label, [param], this));
  }
}

export class NodeUILeaf extends NodeUI {
  constructor(category: string, label: string, param: any[], parent: NodeUIParent) {
    super();
    this.label = label;
    this.params = param;
    this.type = "Leaf";
    this.parent = parent;
    this.category = category;
  }
  category: string;
}

export class NodeInstance implements RegistryInstance {
  constructor(
    private signature: string,
    private name: string,
    private plugin: string,
    private title: string,
    private description: string,
    private icon: string,
    private readonly inputs: InputAnchorInstance[],
    private readonly outputs: OutputAnchorInstance[]
  ) {
    this.func = "return;";
    this.ui = null;
  }
  private ui: NodeUIParent | null;

  private func: any;
  get id(): string {
    return this.id;
  }

  setTitle(title: string) {
    this.title = title;
  }

  setDescription(description: string) {
    this.description = description;
  }

  setIcon(icon: string) {
    this.icon = icon;
  }

  instantiate(plugin: string, name: string) {
    this.plugin = plugin;
    this.name = name;
    this.signature = plugin + "." + name;
  }

  addInput(type: string, anchorname: string) {
    const id = this.plugin + "." + this.name + "." + anchorname;

    const anchor = new InputAnchorInstance(type, id, anchorname);

    this.inputs.push(anchor);
  }

  addOutput(type: string, anchorname: string) {
    const id = this.plugin + "." + this.name + "." + anchorname;

    const anchor = new OutputAnchorInstance(type, id, anchorname);

    this.outputs.push(anchor);
  }

  setFunction(func: any) {
    this.func = func;
  }

  setUI(ui: NodeUIParent) {
    this.ui = ui;
  }

  get getUI(): NodeUIParent | null {
    return this.ui;
  }

  get getTitle(): string {
    return this.title;
  }

  get getDescription(): string {
    return this.description;
  }

  get getIcon(): string {
    return this.icon;
  }

  get getInputAnchorInstances(): InputAnchorInstance[] {
    return this.inputs;
  }

  get getOutputAnchorInstances(): OutputAnchorInstance[] {
    return this.outputs;
  }

  get getSignature(): string {
    return this.signature;
  }
}

export type AnchorType = string; // This uses MIME types E.g. "int", "text/json"

interface AnchorInstance {
  readonly type: AnchorType;
  readonly signature: string;
  readonly displayName: string;
}

export class InputAnchorInstance implements AnchorInstance {
  constructor(
    readonly type: AnchorType,
    readonly signature: string,
    readonly displayName: string
  ) {}
}

export class OutputAnchorInstance implements AnchorInstance {
  constructor(
    readonly type: AnchorType,
    readonly signature: string,
    readonly displayName: string
  ) {}
}
