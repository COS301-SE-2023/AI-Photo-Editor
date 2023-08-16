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
  ui: TileUIParent | null;
  uiConfigs: { [key: string]: UIComponentConfig };
};

export type UIComponentProps = {
  [key: string]: unknown;
};

export abstract class TileUI {
  constructor(
    public parent: TileUI | null,
    public label: string,
    public readonly params: any[],
    public readonly type: string
  ) {}
}

export class TileUIParent extends TileUI {
  constructor(label: string, parent: TileUIParent | null) {
    super(parent, label, [], "parent");
  }
}

export class TileUILeaf extends TileUI {
  constructor(
    public readonly parent: TileUIParent,
    public readonly category: TileUIComponent,
    public readonly label: string,
    public readonly params: UIComponentProps[]
  ) {
    super(parent, label, params, "leaf");
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
