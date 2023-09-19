import { projectCommands } from "./projects/ProjectCommands";
import { coreGraphCommands } from "./core-graph/CoreGraphCommands";
import { type CommandContext, type Command } from "./registries/CommandRegistry";
import { pluginCommands } from "./plugins/pluginCommands";
import { autoUpdater } from "electron-updater";
import logger from "../utils/logger";

const checkForUpdatesCommand: Command = {
  id: "blix.checkForUpdates",
  description: {
    name: "Check for updates...",
    description: "Checks for updates to Blix",
  },
  handler: async (ctx: CommandContext) => {
    try {
      const response = await autoUpdater.checkForUpdatesAndNotify();
      if (response) {
        return { status: "success" };
      } else {
        ctx.sendInformationMessage("You are up to date!");
        return { status: "success", message: "No updates available" };
      }
    } catch (error) {
      logger.error(JSON.stringify(error));
      return { status: "error", message: "Error checking for updates" };
    }
  },
};

export const blixCommands: Command[] = [
  checkForUpdatesCommand,
  ...projectCommands,
  ...coreGraphCommands,
  ...pluginCommands,
];
