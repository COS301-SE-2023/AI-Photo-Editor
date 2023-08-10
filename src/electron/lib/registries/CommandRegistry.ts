import type { Registry } from "./Registry";
import type { ICommand, PaletteView } from "../../../shared/types";
import { Blix } from "../Blix";

export type CommandContext = Blix;

export interface Command {
  id: string;
  handler: CommandHandler;
  description?: CommandDescription | null;
}

export type CommandHandler = (ctx: CommandContext, params?: any) => CommandResponse;

export type CommandResponse<S = unknown, E = unknown> =
  | {
      status: "success";
      message?: string;
      data?: S;
    }
  | {
      status: "error";
      message: string;
      data?: E;
    }
  | {
      status: "palette";
      data: PaletteView;
    };

export interface CommandDescription {
  readonly name: string;
  readonly description: string;
  readonly icon?: string;
  // readonly args?: ReadonlyArray<{
  // Specify arg schema for command here
  // }>;
  // readonly returns?: string    specify return type here
}

export class CommandRegistry implements Registry {
  private registry: { [key: string]: Command } = {};

  constructor(private readonly blix: Blix) {}

  addInstance(instance: Command): void {
    if (!instance) {
      throw Error("Invalid Command");
    }
    this.registry[instance.id] = instance;
    this.blix.mainWindow?.apis.commandClientApi.registryChanged(this.getCommands());
  }

  getRegistry() {
    return { ...this.registry };
  }

  getCommands(): ICommand[] {
    const commands: ICommand[] = [];
    for (const key in this.registry) {
      if (key in this.registry) {
        const command = this.registry[key];
        const commandObject: ICommand = {
          id: command.id,
          name: command.description?.name ?? "",
          description: command.description?.description ?? "",
          icon: command.description?.icon ?? "",
        };
        commands.push(commandObject);
      }
    }
    return commands;
  }

  async runCommand(id: string, params?: any): Promise<CommandResponse> {
    const command = this.registry[id];

    if (!command) {
      throw Error("Invalid Command");
    }

    return command.handler(this.blix, params);
  }
}
