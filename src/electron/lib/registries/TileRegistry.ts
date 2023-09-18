import { type ITile, TileUIParent, type UIComponentConfig } from "../../../shared/ui/TileUITypes";
import type { Registry, RegistryInstance } from "./Registry";
import { type MainWindow } from "../api/apis/WindowApi";
import { Blix } from "../Blix";

export class TileRegistry implements Registry {
  private registry: { [key: string]: TileInstance } = {};

  constructor(private readonly blix: Blix) {}

  addInstance(instance: TileInstance): void {
    this.registry[instance.id] = instance;

    this.blix.mainWindow?.apis.tileClientApi.registryChanged(this.getITiles());
  }
  getRegistry(): { [key: string]: TileInstance } {
    return this.registry;
  }

  getITiles(): ITile[] {
    const tiles: ITile[] = [];

    for (const tile in this.registry) {
      if (this.registry.hasOwnProperty(tile)) {
        const tileInstance: TileInstance = this.registry[tile];
        tiles.push({
          signature: tileInstance.signature,
          name: tileInstance.name,
          plugin: tileInstance.plugin,
          displayName: tileInstance.displayName,
          description: tileInstance.description,
          icon: tileInstance.icon,
          ui: tileInstance.ui,
          uiConfigs: tileInstance.uiConfigs,
        });
      }
    }

    return tiles;
  }
}

export class TileInstance implements RegistryInstance {
  constructor(
    public readonly name: string,
    public readonly plugin: string,
    public readonly displayName: string,
    public readonly description: string,
    public readonly icon: string,
    public readonly ui: { [key: string]: TileUIParent | null },
    public readonly uiConfigs: { [key: string]: UIComponentConfig } = {}
  ) {}

  get id(): string {
    return this.signature;
  }

  get signature(): string {
    return `${this.plugin}.${this.name}`;
  }
}
