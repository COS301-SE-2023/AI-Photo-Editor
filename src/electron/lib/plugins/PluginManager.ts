import { app } from "electron";
import { PathLike, readFile } from "fs";
import { readdirSync } from "fs";
import logger from "../../utils/logger";
import { join } from "path";

export class PluginManager {
  constructor(private plugins: Plugin[]) {}

  private loadedPlugins: Plugin[] = [];

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

        this.requirePlugin(plugin);
      });
    } catch (err) {
      logger.warn("Failed to load plugin: " + plugin);
    }
  }

  // Load a plugin as a Node module
  // See: [https://rollupjs.org/es-module-syntax/#dynamic-import]
  private requirePlugin(plugin: Plugin) {
    try {
      // This uses Node.js require() to load the plugin as a module
      // TODO: ISOLATION + LIMITED API
      // @ts-ignore: no-var-requires
      const pluginModule = require(plugin.mainPath);
      const val = pluginModule.activate(new PluginContext());

      if (typeof pluginModule === "function") {
        pluginModule.activate();
      }

      this.loadedPlugins.push(plugin);
    } catch (err) {
      logger.warn("Failed to require plugin: " + plugin.name);
    }
  }
}

class PluginContext {
  // TODO: Add more stuff here
  get blixVersion() {
    return "0.0.1";
  }
}

interface PackageData {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  repository: string;

  // contributes: {
  //     commands: [
  //         {
  //             "command": "hello-plugin.hello",
  //             "title": "Hello"
  //         }
  //     ],
  //     nodes: [
  //         {
  //             "id": "hello",
  //             "name": "Hello",
  //             "icon": "fa fa-globe"
  //         }
  //     ]
  // },

  main: PathLike;
  renderer: PathLike;

  // devDependencies: {
  //     "@types/node": "^12.0.0",
  //     "typescript": "^3.4.5"
  // },

  // comments: [ "This property will be completely ignored" ]
}

export class Plugin {
  constructor(
    private packageData: PackageData,
    private pluginDir: PathLike,
    private main: PathLike
  ) {}

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
}
