import type { Registry, RegistryInstance } from "../Registry";

export class ToolboxRegistry implements Registry {
  private registry: { [key: string]: NodeInstance } = {};

  addInstance(instance: NodeInstance): void {
    this.registry[instance.getSignature] = instance; // added this because of linter,
    return;
  }
  getRegistry(): { [key: string]: NodeInstance } {
    return this.registry;
  }
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
  ) {}

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
