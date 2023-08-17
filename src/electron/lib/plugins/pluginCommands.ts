import type { Command, CommandContext } from "../../lib/registries/CommandRegistry";
import type { CommandResponse } from "../projects/ProjectCommands";
import { PluginManager } from "./PluginManager";
import { session } from "electron";

export const refreshPluginsCommand: Command = {
  id: "blix.plugins.refrsh",
  description: {
    name: "Refresh plugins...",
    description: "Refreshes the currently loaded plugins",
  },
  handler: async (ctx: CommandContext) => {
    await session.defaultSession.clearCache();

    ctx.pluginManager.loadBasePlugins();
  },
};

export const pluginCommands: Command[] = [refreshPluginsCommand];
