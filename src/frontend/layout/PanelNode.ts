// N-way tree of panels

import type { ComponentType } from "svelte";

export class PanelNode {
  static panelCounter = 0;

  constructor(id = -1) {
    this.parent = null;
    this.index = -1;
    if (id !== -1) {
      this.id = id;
    } else {
      this.id = PanelNode.panelCounter++;
    }
  }

  parent: PanelGroup | null;
  index: number;
  id: number; // Unique ID for each panel, helps Svelte with keying
  size?: number;
}

// Always has a minimum of two children, or self-destructs
export class PanelGroup extends PanelNode {
  static groupCounter = 0;

  // A custom name can optionally be provided
  constructor(name = "", id = -1) {
    super(id);
    this.parent = null;
    if (name !== "") {
      this.name = name;
    } else {
      this.name = `pg_${PanelGroup.groupCounter}`;
    }
    PanelGroup.groupCounter++;
  }
  name: string;
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
    const tempId = this.panels[i].id;
    this.panels[i] = panel;
    panel.parent = this;
    panel.index = i;
    panel.id = tempId;
  }
  addPanel(content: ComponentType, i: number) {
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
    if (this.parent) {
      res = `${this.name}[${this.parent?.name}](${this.index})\n`;
    } else {
      res = `${this.name}[NULL](${this.index})\n`;
    }
    for (const p of this.panels) {
      res += " ".repeat(indent);
      if (p instanceof PanelGroup) {
        res += `- ${p.print(indent + 2)}`;
      } else if (p instanceof PanelLeaf) {
        if (p.parent) {
          res += `+ ${p.content.name}[${p.parent?.name}](${p.index})\n`;
        } else {
          res += `+ ${p.content.name}[NULL](${p.index})\n`;
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
  constructor(public content: ComponentType) {
    super();
    this.parent = null;
  }
}
