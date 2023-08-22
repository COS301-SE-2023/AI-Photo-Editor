import { type PluginContextBuilder } from "./PluginContextBuilder";

import {
  TileUIComponent,
  TileUILeaf,
  TileUIParent,
  type UIComponentProps,
  type UIComponentConfig,
} from "../../../../shared/ui/TileUITypes";
import { TileInstance } from "../../registries/TileRegistry";

type PartialTile = {
  name: string;
  plugin: string;
  displayName: string;
  description: string;
  icon: string;
  ui: { [key: string]: TileUIParent | null };
  uiConfigs: { [key: string]: UIComponentConfig };
};

export class TileBuilder implements PluginContextBuilder {
  private partialTile: PartialTile;

  constructor(plugin: string, name: string) {
    this.partialTile = {
      name,
      plugin,
      displayName: name,
      description: "",
      icon: "",
      ui: {},
      uiConfigs: {},
    };
  }

  get build(): TileInstance {
    return new TileInstance(
      this.partialTile.name,
      this.partialTile.plugin,
      this.partialTile.displayName,
      this.partialTile.description,
      this.partialTile.icon,
      this.partialTile.ui,
      this.partialTile.uiConfigs
    );
  }
  public reset(): void {
    return;
  }

  // TODO: Implement all of these
  public setTitle(title: string): void {
    this.partialTile.displayName = title;
  }
  public setDescription(description: string): void {
    this.partialTile.description = description;
  }
  public addIcon(icon: string): void {
    this.partialTile.icon = icon;
  }
  public setUI(ui: TileUIBuilder): void {
    this.partialTile.ui = ui.getUI();
    this.partialTile.uiConfigs = ui.getUIConfigs();
  }

  public createUIBuilder(): TileUIBuilder {
    const builder = new TileUIBuilder();

    return builder;
  }

  public addUIElement(): void {
    return;
  }
}

function getRandomComponentId(type: TileUIComponent) {
  return `${type.toString()}-${Math.floor(Math.random() * 16 ** 6).toString(16)}`;
}

export class TileUIBuilder {
  private _main: TileUIParent;
  private _sidebar: TileUIParent | null;
  private _statusbar: TileUIParent | null;
  private uiConfigs: { [key: string]: UIComponentConfig };

  constructor() {
    this._main = new TileUIParent("", "", null);
    this._sidebar = null;
    this._statusbar = null;
    this.uiConfigs = {};
  }

  get build(): any {
    return null;
  }

  get main(): TileUIParent {
    return this._main;
  }

  get sidebar(): TileUIParent | null {
    return this._sidebar;
  }

  get statusbar(): TileUIParent | null {
    return this._statusbar;
  }

  public addLayout(builder: TileUIBuilder): void {
    this.main.childUis?.push(builder.getUI());
  }

  public addSidebar(location: string): TileUIBuilder {
    this._sidebar = new TileUIParent("", location, null);
    return this;
  }

  public addStatusbar(location: string): TileUIBuilder {
    this._statusbar = new TileUIParent("", location, null);
    return this;
  }

  // public addKnob(config: UIComponentConfig, props: UIComponentProps): TileUIBuilder {
  //   const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.Knob);
  //   this.node.params.push(new TileUILeaf(this.node, TileUIComponent.Knob, componentId, [props]));
  //   this.uiConfigs[componentId] = {
  //     componentId,
  //     label: config.label,
  //     defaultValue: config.defaultValue ?? 0,
  //     updatesBackend: config.updatesBackend ?? true,
  //   };
  //   return this;
  // }

  // public addButton(config: UIComponentConfig, props: UIComponentProps): TileUIBuilder {
  //   const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.Button);
  //   this.node.params.push(new TileUILeaf(this.node, TileUIComponent.Button, componentId, [props]));
  //   this.uiConfigs[componentId] = {
  //     componentId,
  //     label: config.label,
  //     defaultValue: config.defaultValue ?? "",
  //     updatesBackend: config.updatesBackend ?? false,
  //   };
  //   return this;
  // }

  // public addRadio(config: UIComponentConfig, props: UIComponentProps): TileUIBuilder {
  //   const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.Radio);
  //   this.node.params.push(new TileUILeaf(this.node, TileUIComponent.Radio, componentId, [props]));
  //   this.uiConfigs[componentId] = {
  //     componentId,
  //     label: config.label,
  //     defaultValue: config.defaultValue ?? (props.options ? Object.keys(props.options)[0] : "null"),
  //     updatesBackend: config.updatesBackend ?? true,
  //   };
  //   return this;
  // }

  // public addListBox(): void {
  //   return;
  // }

  // public addSlider(config: UIComponentConfig, props: UIComponentProps): TileUIBuilder {
  //   const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.Slider);
  //   this.node.params.push(new TileUILeaf(this.node, TileUIComponent.Slider, componentId, [props]));
  //   this.uiConfigs[componentId] = {
  //     componentId,
  //     label: config.label,
  //     defaultValue: config.defaultValue ?? 0,
  //     updatesBackend: config.updatesBackend ?? true,
  //   };

  //   return this;
  // }

  // public addToggle(): void {
  //   return;
  // }

  // public addImageInput(config: UIComponentConfig, props: UIComponentProps): TileUIBuilder {
  //   const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.FilePicker);
  //   this.node.params.push(
  //     new TileUILeaf(this.node, TileUIComponent.FilePicker, componentId, [props])
  //   );
  //   this.uiConfigs[componentId] = {
  //     componentId,
  //     label: config.label,
  //     defaultValue: config.defaultValue ?? "",
  //     updatesBackend: config.updatesBackend ?? true,
  //   };
  //   return this;
  // }

  // public addColorPicker(config: UIComponentConfig, props: UIComponentProps): TileUIBuilder {
  //   const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.ColorPicker);
  //   this.node.params.push(
  //     new TileUILeaf(this.node, TileUIComponent.ColorPicker, componentId, [props])
  //   );
  //   this.uiConfigs[componentId] = {
  //     componentId,
  //     label: config.label,
  //     defaultValue: config.defaultValue ?? "#000000",
  //     updatesBackend: config.updatesBackend ?? true,
  //   };
  //   return this;
  // }

  // public addDropdown(config: UIComponentConfig, props: UIComponentProps): TileUIBuilder {
  //   const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.Dropdown);
  //   this.node.params.push(
  //     new TileUILeaf(this.node, TileUIComponent.Dropdown, componentId, [props])
  //   );
  //   this.uiConfigs[componentId] = {
  //     componentId,
  //     label: config.label,
  //     defaultValue: config.defaultValue ?? (props.options ? Object.keys(props.options)[0] : "null"),
  //     updatesBackend: config.updatesBackend ?? true,
  //   };
  //   return this;
  // }

  // public addFilePicker(config: UIComponentConfig, props: UIComponentProps): TileUIBuilder {
  //   const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.FilePicker);
  //   this.node.params.push(
  //     new TileUILeaf(this.node, TileUIComponent.FilePicker, componentId, [props])
  //   );
  //   this.uiConfigs[componentId] = {
  //     componentId,
  //     label: config.label,
  //     defaultValue: config.defaultValue ?? "",
  //     updatesBackend: config.updatesBackend ?? true,
  //   };
  //   return this;
  // }

  // public addTextInput(config: UIComponentConfig, props: UIComponentProps): TileUIBuilder {
  //   const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.TextInput);
  //   this.node.params.push(
  //     new TileUILeaf(this.node, TileUIComponent.TextInput, componentId, [props])
  //   );
  //   this.uiConfigs[componentId] = {
  //     componentId,
  //     label: config.label,
  //     defaultValue: config.defaultValue ?? "empty",
  //     updatesBackend: config.updatesBackend ?? true,
  //   };
  //   return this;
  // }

  // public addNumberInput(config: UIComponentConfig, props: UIComponentProps): TileUIBuilder {
  //   const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.NumberInput);
  //   this.node.params.push(
  //     new TileUILeaf(this.node, TileUIComponent.NumberInput, componentId, [props])
  //   );
  //   this.uiConfigs[componentId] = {
  //     componentId,
  //     label: config.label,
  //     defaultValue: config.defaultValue ?? 0,
  //     updatesBackend: config.updatesBackend ?? true,
  //   };
  //   return this;
  // }

  // public addLabel(config: UIComponentConfig, props: UIComponentProps): TileUIBuilder {
  //   const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.Label);
  //   this.node.params.push(new TileUILeaf(this.node, TileUIComponent.Label, componentId, [props]));
  //   this.uiConfigs[componentId] = {
  //     componentId,
  //     label: config.label,
  //     defaultValue: config.defaultValue ?? "empty",
  //     updatesBackend: config.updatesBackend ?? true,
  //   };
  //   return this;
  // }

  // public addLayerList(): void {
  //   return;
  // }

  // public reset(): void {
  //   return;
  // }

  public getUI(): { [key: string]: TileUIParent | null } {
    return {
      main: this.main,
      sidebar: this.sidebar,
      statusbar: this.statusbar,
    };
  }

  public getUIConfigs(): { [key: string]: UIComponentConfig } {
    return this.uiConfigs;
  }
}
