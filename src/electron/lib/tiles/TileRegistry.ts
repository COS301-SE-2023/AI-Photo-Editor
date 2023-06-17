import type { Registry, RegistryInstance } from "../Registry";

export class TileRegistry implements Registry {
  private registry: { [key: string]: TileInstance } = {};

  addInstance(instance: TileInstance): void {
    return;
  }
  getRegistry(): TileInstance[] {
    return [];
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
    return this.id;
  }
}
