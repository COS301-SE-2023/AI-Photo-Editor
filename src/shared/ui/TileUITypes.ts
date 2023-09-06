import { TileUIBuilder } from "../../electron/lib/plugins/builders/TileBuilder";

export type TileSignature = string;

export type UIComponentConfig = {
  label: string;
  componentId: string;
  defaultValue: unknown;
  updatesBackend: boolean;
};

export type ITile = {
  signature: TileSignature;
  name: string;
  plugin: string;
  displayName: string;
  description: string;
  icon: string;
  ui: { [key: string]: TileUIParent | null };
  uiConfigs: { [key: string]: UIComponentConfig };
};

export type ITileUI = {
  ui: { [key: string]: TileUIParent | null };
  uiConfigs: { [key: string]: UIComponentConfig };
};

export type UIComponentProps = {
  [key: string]: unknown;
};

export abstract class TileUI {
  constructor(
    public parent: TileUI | null,
    public label: string,
    public location: string,
    public readonly params: any[],
    public childUis: ITileUI | null,
    public readonly type: string
  ) {}
}

export class TileUIParent extends TileUI {
  constructor(label: string, location: string, parent: TileUIParent | null) {
    super(parent, label, location, [], null, "parent");
  }
}

export class TileUILeaf extends TileUI {
  constructor(
    public readonly parent: TileUIParent,
    public readonly category: TileUIComponent,
    public readonly label: string,
    public readonly params: UIComponentProps[]
  ) {
    super(parent, label, "", params, null, "leaf");
  }
}

export enum TileUIComponent {
  Button = "Button",
  Slider = "Slider",
  Knob = "Knob",
  Label = "Label",
  Radio = "Radio",
  Dropdown = "Dropdown",
  Accordion = "Accordion",
  NumberInput = "NumberInput",
  TextInput = "TextInput",
  Checkbox = "Checkbox",
  ColorPicker = "ColorPicker",
  FilePicker = "FilePicker",
}
