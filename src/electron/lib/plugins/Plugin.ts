import type { PathLike } from "fs";
import type { PackageData } from "./PluginManager";
import logger from "../../utils/logger";
import { Blix } from "../Blix";
import {
  InputAnchorInstance,
  NodeInstance,
  NodeUIParent,
  OutputAnchorInstance,
} from "../core-graph/ToolboxRegistry";
import { CommandInstance } from "../commands/CommandRegistry";
import { TileInstance } from "../tiles/TileRegistry";
import { NodeBuilder } from "./builders/NodeBuilder";

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

      const inputs: InputAnchorInstance[] = [];
      const outputs: OutputAnchorInstance[] = [];

      if ("nodes" in pluginModule && typeof pluginModule.nodes === "object") {
        // Add to toolbox
        for (const node in pluginModule.nodes) {
          if (!pluginModule.nodes.hasOwnProperty(node)) continue;

          const ui = new NodeUIParent();

          const nodeInstance = new NodeInstance("", "", "", "", "", "", inputs, outputs, ui);

          const nodeBuilder = new NodeBuilder(nodeInstance);

          const ctx = new NodePluginContext(nodeBuilder);

          try {
            pluginModule.nodes[node](ctx); // Execute node builder
            nodeBuilder.validate(); // Ensure the node is properly instantiated
            blix.toolbox.addInstance(nodeInstance); // Add to registry
          } catch (err) {
            logger.warn(err);
          }
        }
      }

      if ("commands" in pluginModule && typeof pluginModule.nodes === "object") {
        // Add to command registry
        for (const cmd in pluginModule.commands) {
          if (!pluginModule.commands.hasOwnProperty(cmd)) continue;

          blix.commandRegistry.addInstance(
            pluginModule.commands[cmd](
              new CommandPluginContext(cmd, this.packageData.name)
            ) as CommandInstance
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
  constructor(private nodeBuilder: NodeBuilder) {
    super();
  }

  public instantiate(plugin: string, name: string): NodeBuilder {
    this.nodeBuilder.instantiate(plugin, name);
    return this.nodeBuilder;
  }
}

class CommandPluginContext extends PluginContext {
  private plugin: string;
  private name: string;
  private description: string;
  private icon: string;
  private command: any;

  constructor(name: string, plugin: string) {
    super();
    this.plugin = plugin;
    this.name = name;
    this.description = "";
    this.icon = "";
    this.command = "";
  }

  public setDescription(description: string) {
    this.description = description;
  }
  public setIcon(icon: string) {
    this.icon = icon;
  }
  public addCommand(command: any) {
    this.command = command;
  }

  public create() {
    return new CommandInstance(this.plugin, this.name, this.description, this.icon, this.command);
  }
}

class TilePluginContext extends PluginContext {}
