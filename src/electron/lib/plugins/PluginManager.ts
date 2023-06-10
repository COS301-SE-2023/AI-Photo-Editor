import { app } from "electron";
import { PathLike, readFile } from "fs";
import { readdirSync } from "fs";
import logger from "../../utils/logger";
import { join } from "path";
import { Plugin } from "./Plugin";
import { Blix } from "../Blix";

export class PluginManager {
  // Stores plugins that have been loaded from disk
  // The plugins have not necessarily been required/activated
  private loadedPlugins: Plugin[] = [];

  constructor(private blix: Blix) {}

  get pluginPaths() {
    const appPath = app.getAppPath();
    const userDataPath = app.getPath("userData");

    const paths = [];

    if (process.env.NODE_ENV !== "production") {
      paths.push(join(appPath, "./blix-plugins"));
    } else {
      // Production
      paths.push(join(userDataPath, "plugins"));
    }

    return paths;
  }

  public loadPlugins() {
    this.pluginPaths.forEach((path) => {
      const plugins = readdirSync(path);

      plugins.forEach((plugin) => {
        this.loadPlugin(plugin, path);
      });
    });
  }

  private loadPlugin(plugin: string, path: string) {
    const pluginPath = join(path, plugin);
    const packageJson = join(pluginPath, "package.json");

    // TODO: Check that the plugin is valid (package.json, main exist; etc.)

    try {
      readFile(packageJson, (err, data) => {
        if (err) throw err;

        const packageData: PackageData = JSON.parse(data.toString());
        const plugin: Plugin = new Plugin(
          packageData,
          pluginPath,
          join(pluginPath, packageData.main.toString())
        );

        this.loadedPlugins.push(plugin);
        plugin.requireSelf(this.blix); // The plugin tries to require its corresponding npm module
      });
    } catch (err) {
      logger.warn("Failed to load plugin: " + plugin);
    }
  }
}
export interface PackageData {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  repository: string;

  contributes: {
    commands: [{ command: string; title: string }];
    nodes: [{ id: string; name: string; icon: string }];
  };

  main: PathLike;
  renderer: PathLike;

  devDependencies: {
    [key: string]: string;
  };

  // comments: [ "This property will be completely ignored" ]
}
