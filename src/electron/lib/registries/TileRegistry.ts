import type { Registry, RegistryInstance } from "./Registry";

export class TileRegistry implements Registry {
  private registry: { [key: string]: TileInstance } = {};

  addInstance(instance: TileInstance): void {
    if (instance) this.registry[instance.id] = instance;
  }
  getRegistry(): { [key: string]: TileInstance } {
    return this.registry;
  }
}

export class TileInstance implements RegistryInstance {
  constructor(
    private readonly signature: string,
    private readonly name: string,
    private readonly description: string,
    private readonly icon: string
  ) {}

  get id(): string {
    return this.signature;
  }
}
