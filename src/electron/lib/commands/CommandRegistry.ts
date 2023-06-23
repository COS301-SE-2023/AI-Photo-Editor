import type { Registry, RegistryInstance } from "../Registry";

export class CommandRegistry implements Registry {
  private registry: { [key: string]: CommandInstance } = {};

  addInstance(instance: CommandInstance): void {
    this.registry[instance.signature] = instance;
  }

  getRegistry(): { [key: string]: CommandInstance } {
    return this.registry;
  }
}

export class CommandInstance implements RegistryInstance {
  constructor(
    private readonly name: string,
    private readonly description: string,
    private readonly icon: string,
    private readonly command: any
  ) {}

  get id(): string {
    return this.id;
  }

  get signature(): string {
    // TODO create unique
    return this.name + "/" + this.name;
  }

  get run(): any {
    return this.command;
  }
}
