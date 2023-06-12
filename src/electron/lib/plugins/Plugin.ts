import { PathLike } from "fs";
import { PackageData } from "./PluginManager";
import logger from "../../utils/logger";
import { Blix } from "../Blix";
import {
  InputAnchorInstance,
  NodeInstance,
  OutputAnchorInstance,
} from "../core-graph/ToolboxRegistry";
import { CommandInstance } from "../commands/CommandRegistry";
import { TileInstance } from "../tiles/TileRegistry";

export type PluginSignature = string;
export type NodeSignature = string;

export class Plugin {
  private hasRequiredSelf: boolean;

  constructor(
    private packageData: PackageData,
    private pluginDir: PathLike,
    private main: PathLike
  ) {
    this.hasRequiredSelf = false;
  }

  get name() {
    return this.packageData.name;
  }

  get displayName() {
    return this.packageData.displayName;
  }

  get mainPath() {
    return this.main.toString();
  }

  get pluginPath() {
    return this.pluginDir.toString();
  }

  // Load this plugin into a local Node module
  // See: [https://rollupjs.org/es-module-syntax/#dynamic-import]
  requireSelf(blix: Blix): void {
    try {
      // This uses Node.js require() to load the plugin as a module
      // TODO: ISOLATION + LIMITED API
      // @ts-ignore: no-var-requires
      const pluginModule = require(this.mainPath);

      if ("nodes" in pluginModule && typeof pluginModule.nodes === "object") {
        // Add to toolbox
        for (const node in pluginModule.nodes) {
          if (!pluginModule.nodes.hasOwnProperty(node)) continue;

          blix.toolbox.addInstance(
            pluginModule.nodes[node](new NodePluginContext()) as NodeInstance
          );
        }
      }

      if ("commands" in pluginModule && typeof pluginModule.nodes === "object") {
        // Add to command registry
        for (const cmd in pluginModule.commands) {
          if (!pluginModule.commands.hasOwnProperty(cmd)) continue;

          blix.commandRegistry.addInstance(
            pluginModule.commands[cmd](new CommandPluginContext()) as CommandInstance
          );
        }
      }

      if ("tiles" in pluginModule && typeof pluginModule.nodes === "object") {
        // Add to tile registry
        for (const tile in pluginModule.tiles) {
          if (!pluginModule.tiles.hasOwnProperty(tile)) continue;

          blix.tileRegistry.addInstance(
            pluginModule.tiles[tile](new TilePluginContext()) as TileInstance
          );
        }
      }

      this.hasRequiredSelf = true;
    } catch (err) {
      logger.warn(`Failed to require plugin: ${this.name}`);
    }
  }
}

class PluginContext {
  // TODO: Add more stuff here
  get blixVersion() {
    return "0.0.1";
  }
}

class NodePluginContext extends PluginContext {
  public nodeBuilder = {
    reset() {
      return;
    },

    addTitle() {
      return;
    },

    compile() {
      return;
    },
  };
}

class CommandPluginContext extends PluginContext {}

class TilePluginContext extends PluginContext {}
