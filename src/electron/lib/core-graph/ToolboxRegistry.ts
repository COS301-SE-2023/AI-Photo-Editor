import type { Registry, RegistryInstance } from "../Registry";

export class ToolboxRegistry implements Registry {
  private registry: { [key: string]: NodeInstance } = {};

  addInstance(instance: NodeInstance): void {
    this.registry[instance.getSignature] = instance;
    return;
  }
  getRegistry(): { [key: string]: NodeInstance } {
    return this.registry;
  }
}

export class NodeUI {
  constructor() {
    this.parent = null;
    this.label = "";
    this.params = [];
  }
  public parent: NodeUI | null;
  label: string;
  params: any[];
}

export class NodeUIParent extends NodeUI {
  constructor(label: string, parent: NodeUIParent | null) {
    super();
    this.label = label;
    this.parent = parent;
    this.params = [];
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
}

export class NodeUILeaf extends NodeUI {
  constructor(type: string, label: string, param: any[], parent: NodeUIParent) {
    super();
    this.label = label;
    this.params = param;
    this.type = type;
    this.parent = parent;
  }
  type: string;
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
