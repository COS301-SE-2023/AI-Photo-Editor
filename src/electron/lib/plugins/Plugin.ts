import type { PathLike } from "fs";
import type { PackageData } from "./PluginManager";
import logger from "../../utils/logger";
import { Blix } from "../Blix";
import type { Command } from "../registries/CommandRegistry";
import { TileInstance } from "../registries/TileRegistry";
import { NodeBuilder } from "./builders/NodeBuilder";
export type PluginSignature = string;

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
    // console.log("Armand")
    try {
      // This uses Node.js require() to load the plugin as a module
      // TODO: ISOLATION + LIMITED API
      // @ts-ignore: no-var-requires

      // We need to clear the local node cache so that the plugin can be reloaded
      delete require.cache[require.resolve(this.mainPath)];
      const pluginModule = require(this.mainPath);

      if ("nodes" in pluginModule && typeof pluginModule.nodes === "object") {
        // Add to toolbox
        for (const node in pluginModule.nodes) {
          if (!pluginModule.nodes.hasOwnProperty(node)) continue;

          const ctx = new NodePluginContext();

          try {
            pluginModule.nodes[node](ctx); // Execute node builder
            blix.toolbox.addInstance(ctx.nodeBuilder.build); // Add to registry
          } catch (err) {
            logger.warn(err);
          }
          // console.log(blix.toolbox.getRegistry()[nodeInstance.getSignature])
        }
        // blix.aiManager.instantiate(blix.toolbox);
      }

      if ("commands" in pluginModule && typeof pluginModule.nodes === "object") {
        // Add to command registry
        for (const cmd in pluginModule.commands) {
          if (!pluginModule.commands.hasOwnProperty(cmd)) continue;

          blix.commandRegistry.addInstance(
            pluginModule.commands[cmd](
              new CommandPluginContext(cmd, this.packageData.name, blix)
            ) as Command
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
      logger.warn(err);
    }
  }
}

export class PluginContext {
  // TODO: Add more stuff here
  get blixVersion() {
    return "0.0.1";
  }
}

export class NodePluginContext extends PluginContext {
  private _nodeBuilder!: NodeBuilder;
  constructor() {
    super();
  }

  public get nodeBuilder() {
    return this._nodeBuilder;
  }

  // nodeBuilder = context.instantiate("hello-plugin","hello");
  // TODO: Change this: it should not be done in the plugin,
  // but when the plugin loads. The plugin already defines each node name as the key
  // in the dictionary, and we already know the plugin name in the package.json
  public instantiate(plugin: string, name: string): NodeBuilder {
    this._nodeBuilder = new NodeBuilder(plugin, name);
    return this.nodeBuilder;
  }
}

export class CommandPluginContext extends PluginContext {
  private plugin: string;
  private name: string;
  private displayName: string;
  private description: string;
  private icon: string;
  private command: any;
  private blix: Blix;

  constructor(name: string, plugin: string, blix: Blix) {
    super();
    this.plugin = plugin;
    this.name = name;
    this.description = "";
    this.icon = "";
    this.command = "";
    this.blix = blix;
    this.displayName = "";
  }

  // public get getMainWindow() {
  //   return this.mainWindow;
  // }

  public setDescription(description: string) {
    this.description = description;
  }
  public setIcon(icon: string) {
    this.icon = icon;
  }
  public addCommand(command: any) {
    this.command = command;
  }

  public setDisplayName(displayName: string) {
    this.displayName = displayName;
  }

  public getBlix() {
    return this.blix;
  }

  public create(): Command {
    return {
      id: `${this.plugin}.${this.name}`,
      handler: this.command,
      description: {
        name: this.displayName,
        description: this.description,
        icon: this.icon,
      },
    };
  }
}

class TilePluginContext extends PluginContext {}
