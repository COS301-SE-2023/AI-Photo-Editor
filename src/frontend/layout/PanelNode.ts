// N-way tree of panels
export class PanelNode {
  constructor() {
    this.parent = null;
    this.index = -1;
  }

  parent: PanelGroup | null;
  index: number;
}

// Always has a minimum of two children, or self-destructs
export class PanelGroup extends PanelNode {
  constructor(public name: string) {
    super();
    this.parent = null;
  }

  panels: PanelNode[] = [];

  // Nukes the current panelgroup and replaces it with its first child if possible
  removePanel(i: number) {
    this.panels.splice(i, 1);

    // If length 1, dissolve and replace with child
    if (this.panels.length === 1) {
      if (this.parent != null) {
        this.parent.setPanel(this.panels[0], this.index);
      }
    }
    // If empty, dissolve (Shouldn't ever happen anyway)
    if (this.panels.length === 0) {
      if (this.parent != null) {
        this.parent.removePanel(this.index);
      }
    }
  }
  setPanel(panel: PanelNode, i: number) {
    this.panels[i] = panel;
    panel.parent = this;
    panel.index = i;
  }
  addPanel(content: string, i: number) {
    const newLeaf = new PanelLeaf(content);
    this.panels.splice(i, 0, newLeaf);
    newLeaf.parent = this;
    newLeaf.index = i;
  }
  addPanelGroup(panelGroup: PanelGroup, i: number) {
    this.panels.splice(i, 0, panelGroup);
    panelGroup.parent = this;
    panelGroup.index = i;
  }
  getPanel(i: number): PanelNode {
    return this.panels[i];
  }

  // Print tree for debug
  print(indent = 0): string {
    let res;
    if(this.parent){
      res = `${this.name}[${this.parent?.name}](${this.index})\n`; }
    else{ 
      res = `${this.name}[NULL](${this.index})\n`; }
    for (const p of this.panels) {
      res += " ".repeat(indent);
      if (p instanceof PanelGroup) {
        res += `- ${p.print(indent + 2)}`;
      } else if (p instanceof PanelLeaf) {
        if(p.parent){
          res += `+ ${p.content}[${p.parent?.name}](${p.index})\n`;
        }
        else{
          res += `+ ${p.content}[NULL](${p.index})\n`;
        }
      }
    }
    return res;
  }

  recurseParent() {
    for (let p = 0; p < this.panels.length; p++) {
      const panel = this.panels[p];
      panel.parent = this;
      panel.index = p;

      if (panel instanceof PanelGroup) {
        panel.recurseParent();
      }
    }
  }
}

export class PanelLeaf extends PanelNode {
  constructor(public content: string) {
    super();
    this.parent = null;
  }
}
