import { app } from "electron";
import { type PathLike, readFile } from "fs";
import { readdirSync } from "fs";
import logger from "../../utils/logger";
import { join } from "path";
import { Plugin } from "./Plugin";
import { Blix } from "../Blix";
import { promisify } from "util";
import chokidar from "chokidar";

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

    if (app.isPackaged) {
      // Production
      paths.push(join(userDataPath, "plugins"));
    } else {
      paths.push(join(appPath, "./blix-plugins"));
    }

    return paths;
  }

  public watchPlugins() {
    // This is only checking the first plugin directory
    chokidar
      .watch(".", { depth: 0, ignoreInitial: true, cwd: this.pluginPaths[0] })
      .on("addDir", async (plugin) => {
        await this.loadPlugin(plugin, this.pluginPaths[0]);
        this.blix.mainWindow?.apis.commandClientApi.registryChanged(
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

  /**
   * Loads the base plugins that come packaged with Blix. This method may need
   * modification to also load installed plugins in the userData directory.
   */
  public async loadBasePlugins(flag = false) {
    this.loadedPlugins = [];
    const appPath = app.getAppPath();
    const pluginsPath = join(app.isPackaged ? process.resourcesPath : appPath, "blix-plugins");
    const ignorePatterns = [".DS_Store"];

    // TODO: Make plugin loading async
    // See: [https://stackoverflow.com/a/52243773]

    // Read blix-plugins/ directory
    const dirents = readdirSync(pluginsPath, { withFileTypes: true });
    // Ignore files (only directories)
    const plugins = dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);

    plugins.filter((plugin) => {
      return !ignorePatterns.some((pattern) => plugin.includes(pattern));
    });

    await Promise.all(
      plugins.map(async (plugin) => {
        // Ignore MacOS temp files
        if (plugin !== ".DS_Store") {
          await this.loadPlugin(plugin, pluginsPath, flag);
        }
      })
    );
    // this.blix.aiManager.instantiate(this.blix.toolbox);
  }

  public async loadPlugin(plugin: string, path: string, flag = false): Promise<void> {
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

      const pluginInstance: Plugin = new Plugin(packageData, pluginPath);

      this.loadedPlugins.push(pluginInstance);
      pluginInstance.requireSelf(this.blix, flag); // The plugin tries to require its corresponding npm module
    } catch (err) {
      logger.warn("Failed to load plugin: " + plugin + ", package.json failed to load");
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
  renderers: { [key: string]: PathLike };

  devDependencies: {
    [key: string]: string;
  };

  // comments: [ "This property will be completely ignored" ]
}
