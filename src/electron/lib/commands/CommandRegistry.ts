import type { Registry, RegistryInstance } from "../Registry";

export class CommandRegistry implements Registry {
  private registry: { [key: string]: CommandInstance } = {};

  addInstance(instance: CommandInstance): void {
    this.registry[instance.signature] = instance;
  }

  getRegistry(): { [key: string]: CommandInstance } {
    return this.registry;
  }

  getCommandNames(): string[] {
    return Object.keys(this.registry);
  }

  runCommand(command: string) {
    this.registry[command].run();
  }
}

export class CommandInstance implements RegistryInstance {
  constructor(
    private readonly _plugin: string,
    private readonly _name: string,
    private readonly _description: string,
    private readonly _icon: string,
    private readonly _command: any
  ) {}

  get id(): string {
    return this.id;
  }

  get signature(): string {
    // TODO create unique
    return this._plugin + "." + this._name;
  }

  get name(): string {
    return this._name;
  }

  get run(): any {
    return this._command;
  }
}
