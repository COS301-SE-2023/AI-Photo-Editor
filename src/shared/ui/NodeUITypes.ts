// This should probably become virtual
export abstract class NodeUI {
  constructor() {
    this.parent = null;
    this.label = "";
    this.params = [];
    this.type = "ui";
  }
  public parent: NodeUI | null;
  public label: string;
  public params: any[];
  public type: string;
}

export class NodeUIParent extends NodeUI {
  constructor(label: string, parent: NodeUIParent | null) {
    super();
    this.label = label;
    this.parent = parent;
    this.params = [];
    this.type = "parent";
  }

  label: string;
  params: NodeUI[];
}

export class NodeUILeaf extends NodeUI {
  constructor(
    public category: NodeUIComponent,
    public label: string,
    public param: any[],
    public parent: NodeUIParent
  ) {
    super();
    this.type = "leaf";
  }
}

export enum NodeUIComponent {
  Button = "Button",
  Slider = "Slider",
  Knob = "Knob",
  Label = "Label",
  Radio = "Radio",
  Dropdown = "Dropdown",
  NumberInput = "NumberInput",
  TextInput = "TextInput",
  Checkbox = "Checkbox",
  ColorPicker = "ColorPicker",
  FilePicker = "FilePicker",
}
