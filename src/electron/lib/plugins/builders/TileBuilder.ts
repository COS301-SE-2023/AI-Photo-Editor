import { type PluginContextBuilder } from "./PluginContextBuilder";

import {
  TileUIComponent,
  TileUILeaf,
  TileUIParent,
  type ITileUI,
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

/**
 * TileBuilder is a builder class for creating TileInstance objects.
 * It is used to create a TileInstance object that can be registered with the TileRegistry.
 */

export class TileBuilder implements PluginContextBuilder {
  private partialTile: PartialTile;

  /**
   * @param plugin string
   * @param name string
   */

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

  /**
   * Returns the TileInstance object that has been built.
   * @returns TileInstance
   */

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

  /**
   * Resets the tile builder's tile instance to its initial state
   * @returns void
   */

  public reset(): void {
    this.partialTile = {
      name: this.partialTile.name,
      plugin: this.partialTile.plugin,
      displayName: this.partialTile.displayName,
      description: "",
      icon: "",
      ui: {},
      uiConfigs: {},
    };

    return;
  }

  // TODO: Implement all of these

  /**
   * Sets the title of the tile
   * @param title string
   * @returns void
   */
  public setTitle(title: string): void {
    this.partialTile.displayName = title;
  }

  /**
   * Sets the description of the tile
   * @param description string
   * @returns void
   */
  public setDescription(description: string): void {
    this.partialTile.description = description;
  }

  /**
   * Sets the icon of the tile
   * @param icon string
   * @returns void
   */
  public addIcon(icon: string): void {
    this.partialTile.icon = icon;
  }

  /**
   * Sets the UI of the tile
   * @param ui ITileUI
   * @returns void
   */
  public setUI(ui: TileUIBuilder): void {
    this.partialTile.ui = ui.getUI();
    this.partialTile.uiConfigs = ui.getUIConfigs();
  }

  /**
   * Creates a new TileUIBuilder object
   * @returns TileUIBuilder
   */

  public createUIBuilder(): TileUIBuilder {
    const builder = new TileUIBuilder();

    return builder;
  }

  /**
   * adds a new UI element to the tile
   * @todo implement this function
   * @returns void
   */

  public addUIElement(): void {
    return;
  }
}

/**
 * Returns a random component id for a given TileUIComponent
 * @param type TileUIComponent
 * @returns string
 */

function getRandomComponentId(type: TileUIComponent): string {
  return `${type.toString()}-${Math.floor(Math.random() * 16 ** 6).toString(16)}`;
}

export function forTesting() {
  // to allow testing of getRandomComponentId
  return getRandomComponentId;
}

export class TileUIBuilder {
  private _main: TileUIParent;
  private _sidebar: tileUIComponentBuilder | null;
  private _statusbar: tileUIComponentBuilder | null;
  private uiConfigs: { [key: string]: UIComponentConfig };

  constructor() {
    this._main = new TileUIParent("", "", null);
    this._sidebar = null;
    this._statusbar = null;
    this.uiConfigs = {};
  }

  /**
   * Returns the TileUI object that has been built.
   * @returns any
   * @todo implement this function
   */
  get build(): any {
    return null;
  }

  /**
   * Returns the main TileUIParent object
   * @returns TileUIParent
   */

  get main(): TileUIParent {
    return this._main;
  }

  /**
   * Returns the sidebar TileUIParent object
   * @returns tileUIComponentBuilder | null
   */
  get sidebar(): tileUIComponentBuilder | null {
    return this._sidebar;
  }

  /**
   * Returns the statusbar TileUIParent object
   * @returns tileUIComponentBuilder | null
   */

  get statusbar(): tileUIComponentBuilder | null {
    return this._statusbar;
  }

  /**
   * Adds a layout to this builders main childUIs
   * @param builder
   * @returns void
   */

  public addLayout(builder: TileUIBuilder): void {
    this.main.childUis = { ui: builder.getUI(), uiConfigs: builder.getUIConfigs() };
  }

  /**
   * Adds a sidebar to this builders sidebar
   * @param location string
   * @returns
   */

  public addSidebar(location: string): TileUIBuilder {
    this._sidebar = new tileUIComponentBuilder("", location);
    return this;
  }

  /**
   * Adds a statusbar to this builders statusbar
   * @param location string
   * @returns
   */
  public addStatusbar(location: string): TileUIBuilder {
    this._statusbar = new tileUIComponentBuilder("", location);
    return this;
  }

  // public addLayerList(): void {
  //   return;
  // }

  // public reset(): void {
  //   return;
  // }

  /**
   * Gets the UI object that has been built.
   * @returns { [key: string]: TileUIParent | null }
   */

  public getUI(): { [key: string]: TileUIParent | null } {
    return {
      main: this.main,
      sidebar: this.sidebar ? this.sidebar.component : null,
      statusbar: this.statusbar ? this.statusbar.component : null,
    };
  }

  /**
   * Gets the UI configs that have been built.
   * @returns { [key: string]: UIComponentConfig }
   */

  public getUIConfigs(): { [key: string]: UIComponentConfig } {
    return Object.assign({}, this.uiConfigs, this.sidebar?.uiConfigs, this.statusbar?.uiConfigs);
  }
}

/**
 * TileUIComponentBuilder is a builder class for creating TileUIParent objects.
 */
class tileUIComponentBuilder {
  private _component: TileUIParent;
  private _uiConfigs: { [key: string]: UIComponentConfig };

  get component() {
    return this._component;
  }

  get uiConfigs() {
    return this._uiConfigs;
  }

  constructor(label: string, location: string) {
    this._component = new TileUIParent(label, location, null);
    this._uiConfigs = {};
  }

  /**
   * Adds a button to this builders component
   * @param config UIComponentConfig
   * @param props UIComponentProps
   * @returns tileUIComponentBuilder
   */

  public addButton(config: UIComponentConfig, props: UIComponentProps): tileUIComponentBuilder {
    const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.Button);
    this._component?.params.push(
      new TileUILeaf(this._component, TileUIComponent.Button, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? "",
      updatesBackend: config.updatesBackend ?? false,
    };
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

  /**
   * Adds a slider to this builders component
   * @param config
   * @param props
   * @returns tileUIComponentBuilder
   */

  public addSlider(config: UIComponentConfig, props: UIComponentProps): tileUIComponentBuilder {
    const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.Slider);
    this.component.params.push(
      new TileUILeaf(this.component, TileUIComponent.Slider, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? 0,
      updatesBackend: config.updatesBackend ?? true,
    };
    return this;
  }

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

  /**
   * Adds a dropdown to this builders component
   * @param config
   * @param props
   * @returns tileUIComponentBuilder
   */

  public addDropdown(config: UIComponentConfig, props: UIComponentProps): tileUIComponentBuilder {
    const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.Dropdown);
    this.component.params.push(
      new TileUILeaf(this._component, TileUIComponent.Dropdown, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? (props.options ? Object.keys(props.options)[0] : "null"),
      updatesBackend: config.updatesBackend ?? true,
    };
    return this;
  }

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

  /**
   * Adds a text input to this builders component
   * @param config
   * @param props
   * @returns tileUIComponentBuilder
   */

  public addTextInput(config: UIComponentConfig, props: UIComponentProps): tileUIComponentBuilder {
    const componentId = config.componentId ?? getRandomComponentId(TileUIComponent.TextInput);
    this.component.params.push(
      new TileUILeaf(this.component, TileUIComponent.TextInput, componentId, [props])
    );
    this.uiConfigs[componentId] = {
      componentId,
      label: config.label,
      defaultValue: config.defaultValue ?? "empty",
      updatesBackend: config.updatesBackend ?? true,
    };
    return this;
  }

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
}
