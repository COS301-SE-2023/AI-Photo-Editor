import { Registry, RegistryInstance } from "../Registry";

export class CommandRegistry implements Registry {
  private registry: { [key: string]: CommandInstance } = {};

  addInstance(instance: CommandInstance): void {
    return;
  }
  getRegistry(): CommandInstance[] {
    return [];
  }
}

export class CommandInstance implements RegistryInstance {
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
