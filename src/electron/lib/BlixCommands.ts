import { projectCommands } from "./projects/ProjectCommands";
import { type Command } from "./registries/CommandRegistry";

export const blixCommands: Command[] = [...projectCommands];
