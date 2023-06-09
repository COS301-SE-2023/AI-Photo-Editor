import { PathLike } from "fs";
import { PackageData } from "./PluginManager";

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

export class PluginContext {
  // TODO: Add more stuff here
  get blixVersion() {
    return "0.0.1";
  }
}
