import { TileUIParent, type UIComponentConfig } from "../../../shared/ui/TileUITypes";
import type { Registry, RegistryInstance } from "./Registry";
import { type MainWindow } from "../api/apis/WindowApi";

export class TileRegistry implements Registry {
  private registry: { [key: string]: TileInstance } = {};

  constructor(readonly mainWindow?: MainWindow) {}

  addInstance(instance: TileInstance): void {
    this.registry[instance.id] = instance;

    this.mainWindow?.apis.tileClientApi.registryChanged("test");
  }
  getRegistry(): { [key: string]: TileInstance } {
    return this.registry;
  }
}

export class TileInstance implements RegistryInstance {
  constructor(
    public readonly name: string,
    public readonly plugin: string,
    public readonly displayName: string,
    public readonly description: string,
    public readonly icon: string,
    public readonly ui: TileUIParent | null = null,
    public readonly uiConfigs: { [key: string]: UIComponentConfig } = {}
  ) {}

  get id(): string {
    return this.signature;
  }

  get signature(): string {
    return `${this.plugin}.${this.name}`;
  }
}
