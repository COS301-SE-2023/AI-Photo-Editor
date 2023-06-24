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
    this.index = -1;
    this.parent = null;
  }
  private index: number;
  public parent: NodeUI | null;
}

export class NodeUIParent extends NodeUI {
  constructor() {
    super();
    this.params = [];
  }
  params: NodeUI[];

  public addButton(name: string, param: string): void {
    this.params.push(new NodeUILeaf(name, param));
  }
}

export class NodeUILeaf extends NodeUI {
  constructor(name: string, param: string) {
    super();
    this.name = name;
    this.param = param;
  }
  name: string;
  param: string;
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
    private readonly outputs: OutputAnchorInstance[],
    private ui: NodeUIParent
  ) {
    this.func = "return;";
  }

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
