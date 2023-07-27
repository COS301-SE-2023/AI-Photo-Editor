import { projectCommands } from "./projects/ProjectCommands";
import { coreGraphCommands } from "./core-graph/CoreGraphCommands";
import { type Command } from "./registries/CommandRegistry";

export const blixCommands: Command[] = [...projectCommands, ...coreGraphCommands];
