import { projectCommands } from "./projects/ProjectCommands";
import { coreGraphCommands } from "./core-graph/CoreGraphCommands";
import { type Command } from "./registries/CommandRegistry";
import { pluginCommands } from "./plugins/pluginCommands";

export const blixCommands: Command[] = [
  ...projectCommands,
  ...coreGraphCommands,
  ...pluginCommands,
];
