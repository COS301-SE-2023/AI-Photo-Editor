import type { Registry, RegistryInstance } from "../Registry";
import type { ICommand } from "../../../shared/types";

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

  getCommands(): ICommand[] {
    const commands: ICommand[] = [];
    for (const command in this.registry) {
      if (this.registry.hasOwnProperty(command)) {
        const commandInstance: CommandInstance = this.registry[command];
        const commandObject = {
          signature: commandInstance.signature,
          displayName: commandInstance.displayName,
          description: commandInstance.description,
          icon: commandInstance.icon,
        };
        commands.push(commandObject);
      }
    }
    return commands;
  }

  runCommand(command: string) {
    this.registry[command].run();
  }
}

export class CommandInstance implements RegistryInstance {
  private _id: string;
  constructor(
    private readonly _plugin: string,
    private readonly _name: string,
    private readonly _displayName: string,
    private readonly _description: string,
    private readonly _icon: string,
    private readonly _command: any
  ) {
    this._id = "";
  }

  get id(): string {
    return this._id;
  }

  get signature(): string {
    // TODO create unique
    return this._plugin + "." + this._name;
  }

  get plugin(): string {
    return this._plugin;
  }

  get name(): string {
    return this._name;
  }

  get displayName(): string {
    return this._displayName;
  }

  get description(): string {
    return this._description;
  }

  get icon(): string {
    return this._icon;
  }

  get run(): any {
    return this._command;
  }
}
