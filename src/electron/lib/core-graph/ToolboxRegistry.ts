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
    private readonly icon: string
  ) {}

  get id(): string {
    return this.id;
  }
}
