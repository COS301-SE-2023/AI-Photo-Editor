// This should probably become virtual
export class NodeUI {
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
  constructor(category: string, label: string, param: any[], parent: NodeUIParent) {
    super();
    this.label = label;
    this.params = param;
    this.type = "leaf";
    this.parent = parent;
    this.category = category;
  }
  category: string;
}
