import { app } from "electron";
import { type PathLike, readFile } from "fs";
import { readdirSync } from "fs";
import logger from "../../utils/logger";
import { join } from "path";
import { Plugin } from "./Plugin";
import { Blix } from "../Blix";
import { promisify } from "util";
import chokibar from "chokidar";
import { log } from "console";

export class PluginManager {
  // Stores plugins that have been loaded from disk
  // The plugins have not necessarily been required/activated
  private loadedPlugins: Plugin[] = [];

  constructor(private blix: Blix) {
    this.watchPlugins();
  }

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

    logger.info(paths);

    return paths;
  }

  public watchPlugins() {
    // This is only checking the first plugin directory
    chokibar
      .watch(".", { depth: 0, ignoreInitial: true, cwd: this.pluginPaths[0] })
      .on("addDir", async (plugin) => {
        await this.loadPlugin(plugin, this.pluginPaths[0]);
        this.blix.mainWindow?.apis.commandRegistryApi.registryChanged(
          this.blix.commandRegistry.getCommands()
        );
      });
  }

  public loadPlugins() {
    this.pluginPaths.forEach((path) => {
      const plugins = readdirSync(path);

      plugins.forEach((plugin) => {
        this.loadPlugin(plugin, path);
      });
    });
  }

  private async loadPlugin(plugin: string, path: string) {
    const readFilePromise = promisify(readFile);

    const pluginPath = join(path, plugin);
    const packageJson = join(pluginPath, "package.json");

    // TODO: Check that the plugin is valid (package.json content)

    try {
      const data = await readFilePromise(packageJson);
      const packageData: PackageData = JSON.parse(data.toString());

      const mainPath = join(pluginPath, packageData.main.toString());

      try {
        await readFilePromise(mainPath);
      } catch (err) {
        logger.warn("Failed to load plugin: " + plugin + ", main not found");
        return;
      }

      const pluginInstance: Plugin = new Plugin(packageData, pluginPath, mainPath);

      this.loadedPlugins.push(pluginInstance);
      pluginInstance.requireSelf(this.blix); // The plugin tries to require its corresponding npm module
    } catch (err) {
      logger.warn("Failed to load plugin: " + plugin + ", package.json not found");
      return;
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
