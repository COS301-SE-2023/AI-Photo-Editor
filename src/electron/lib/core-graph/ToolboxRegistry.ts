import { Registry, RegistryInstance } from "../Registry";

export class ToolboxRegistry implements Registry {
  private registry: { [key: string]: NodeInstance } = {};

  addInstance(instance: NodeInstance): void {
    return;
  }
  getRegistry(): NodeInstance[] {
    return [];
  }
}

export class NodeInstance implements RegistryInstance {
  constructor(
    private readonly signature: string,
    private readonly name: string,
    private readonly description: string,
    private readonly icon: string,
    private readonly inputs: InputAnchorInstance[],
    private readonly outputs: OutputAnchorInstance[]
  ) {}

  get id(): string {
    return this.id;
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
