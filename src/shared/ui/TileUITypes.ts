export type UIComponentConfig = {
  label: string;
  componentId: string;
  defaultValue: unknown;
  updatesBackend: boolean;
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

// TODO: Add a way to optionally link each leaf to an input anchor
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
