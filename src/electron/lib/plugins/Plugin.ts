import type { PathLike } from "fs";
import type { PackageData } from "./PluginManager";
import logger from "../../utils/logger";
import { Blix } from "../Blix";
import type { Command } from "../registries/CommandRegistry";
import { TileInstance } from "../registries/TileRegistry";
import { NodeBuilder } from "./builders/NodeBuilder";
import { TileBuilder } from "./builders/TileBuilder";
import { join } from "path";
import { MediaDisplayType } from "../../../shared/types/media";
import { TypeclassBuilder } from "./builders/TypeclassBuilder";
export type PluginSignature = string;

export class Plugin {
  private hasRequiredSelf: boolean;
  private main: PathLike;
  private renderers: { [key: string]: PathLike };

  constructor(private packageData: PackageData, private pluginDir: PathLike) {
    this.hasRequiredSelf = false;
    this.main = join(pluginDir.toString(), packageData.main.toString());

    this.renderers = {};
    if (typeof packageData.renderers === "object") {
      Object.keys(packageData.renderers).forEach((key) => {
        this.renderers[key] = join(pluginDir.toString(), packageData.renderers[key].toString());
      });
    } else {
      logger.warn("Invalid renderers in plugin: " + this.name);
    }
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
  requireSelf(blix: Blix, force = false): void {
    try {
      // This uses Node.js require() to load the plugin as a module
      // TODO: ISOLATION + LIMITED API
      // @ts-ignore: no-var-requires

      // We need to clear the local node cache so that the plugin can be reloaded
      delete require.cache[require.resolve(this.mainPath)];
      const pluginModule = require(this.mainPath);

      // ========== RENDERERS ========== //
      Object.keys(this.renderers).forEach((key) => {
        blix.typeclassRegistry.addRenderer(`${this.name}/${key}`, this.renderers[key].toString());
      });

      // ========== NODES ========== //
      if ("nodes" in pluginModule && typeof pluginModule.nodes === "object") {
        // Add to toolbox
        for (const node in pluginModule.nodes) {
          if (!pluginModule.nodes.hasOwnProperty(node)) continue;

          const ctx = new NodePluginContext(this.name);

          try {
            pluginModule.nodes[node](ctx); // Execute node builder
            blix.toolbox.addInstance(ctx.nodeBuilder.build); // Add to registry
          } catch (err) {
            logger.warn(err);
          }
        }
      }

      // ========== COMMANDS ========== //
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

      // ========== TILES ========== //
      if ("tiles" in pluginModule && typeof pluginModule.nodes === "object") {
        // Add to tile registry

        for (const tile in pluginModule.tiles) {
          if (!pluginModule.tiles.hasOwnProperty(tile)) continue;

          const ctx = new TilePluginContext(this.name);

          // try {
          //   pluginModule.tiles[tile](ctx); // Execute tile builder
          //   blix.tileRegistry.addInstance(ctx.tileBuilder.build); // Add to registry
          // } catch (err) {
          //   logger.warn(err);
          // }
        }
      }

      // ========== INIT ========== //
      if ("init" in pluginModule && typeof pluginModule.init === "function") {
        const ctx = new InitPluginContext(this.name);
        pluginModule.init(ctx);

        // Obtain typeclasses
        ctx.typeclassBuilders.forEach((builder) => {
          const [typeclass, converters] = builder.build;
          blix.typeclassRegistry.addInstance(typeclass, force);
          converters.forEach((converter) => blix.typeclassRegistry.addConverter(...converter));
        });
      }

      this.hasRequiredSelf = true;
    } catch (err) {
      logger.warn(`Failed to require plugin: ${this.name}`);
      logger.warn(err);
    }
  }
}

export class PluginContext {
  constructor(private plugin: string) {}

  // TODO: Add more stuff here
  get blixVersion() {
    return "0.0.1";
  }

  get pluginId() {
    return this.plugin;
  }
}

export class NodePluginContext extends PluginContext {
  private _nodeBuilder!: NodeBuilder;
  constructor(plugin: string) {
    super(plugin);
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
  private name: string;
  private displayName: string;
  private description: string;
  private icon: string;
  private command: any;
  private blix: Blix;

  constructor(name: string, plugin: string, blix: Blix) {
    super(plugin);
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
      id: `${this.pluginId}.${this.name}`,
      handler: this.command,
      description: {
        name: this.displayName,
        description: this.description,
        icon: this.icon,
      },
    };
  }
}

class TilePluginContext extends PluginContext {
  private _tileBuilder!: TileBuilder;
  constructor(plugin: string) {
    super(plugin);
  }

  public get tileBuilder() {
    return this._tileBuilder;
  }

  public instantiate(plugin: string, name: string): TileBuilder {
    this._tileBuilder = new TileBuilder(plugin, name);
    return this.tileBuilder;
  }
}

class InitPluginContext extends PluginContext {
  private _typeclassBuilders: TypeclassBuilder[];

  constructor(plugin: string) {
    super(plugin);
    this._typeclassBuilders = [];
  }

  public createTypeclassBuilder(typeclassId: string) {
    const builder = new TypeclassBuilder(this.pluginId, typeclassId);
    this._typeclassBuilders.push(builder);
    return builder;
  }

  public get typeclassBuilders() {
    return this._typeclassBuilders;
  }
}
