export type UIComponentConfig = {
  label: string;
  componentId: string;
  defaultValue: unknown;
  updatesBackend: boolean;
};

export type UIComponentProps = {
  [key: string]: unknown;
};

export abstract class NodeUI {
  constructor(
    public parent: NodeUI | null,
    public label: string,
    public readonly params: any[],
    public readonly type: string
  ) {}
}

export class NodeUIParent extends NodeUI {
  constructor(label: string, parent: NodeUIParent | null) {
    super(parent, label, [], "parent");
  }
}

// TODO: Add a way to optionally link each leaf to an input anchor
export class NodeUILeaf extends NodeUI {
  constructor(
    public readonly parent: NodeUIParent,
    public readonly category: NodeUIComponent,
    public readonly label: string,
    public readonly params: UIComponentProps[]
  ) {
    super(parent, label, params, "leaf");
  }
}

export enum NodeUIComponent {
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
