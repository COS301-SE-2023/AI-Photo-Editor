import type { Command, CommandContext } from "../../lib/registries/CommandRegistry";
import { PluginManager } from "./PluginManager";
import { session } from "electron";

export const refreshPluginsCommand: Command = {
  id: "blix.plugins.refresh",
  description: {
    name: "Refresh plugins...",
    description: "Refreshes the currently loaded plugins",
  },

  handler: async (ctx: CommandContext) => {
    await session.defaultSession.clearCache();

    ctx.pluginManager.loadBasePlugins();

    return { status: "success" };
  },
};

export const pluginCommands: Command[] = [refreshPluginsCommand];
