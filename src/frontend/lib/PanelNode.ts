// N-way tree of panels

import type { LayoutPanel, PanelType } from "@shared/types/index";
import { tick } from "svelte";
import { writable } from "svelte/store";

export abstract class PanelNode {
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
  // IMPORTANT: If id is replaced with a string at some point,
  //            that string _cannot_ contain the "_" character because
  //            we use that to do string splitting in Graph.svelte
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
    this.updateParent(this);
  }
  setPanel(panel: PanelNode, i: number) {
    const tempId = this.panels[i].id;
    this.panels[i] = panel;
    panel.parent = this;
    panel.index = i;
    panel.id = tempId;
  }
  addPanel(content: PanelType, i: number) {
    const newLeaf = new PanelLeaf(content);
    this.panels.splice(i, 0, newLeaf);
    newLeaf.parent = this;
    newLeaf.index = i;

    this.updateParent(this);
  }
  addPanelGroup(panelGroup: PanelGroup, i: number) {
    this.panels.splice(i, 0, panelGroup);
    panelGroup.parent = this;
    panelGroup.index = i;
  }
  getPanel(i: number): PanelNode {
    return this.panels[i];
  }

  updateParent(_current: PanelGroup) {
    let current = _current;
    while (current.parent != null) {
      current = current.parent;
    }
    current = current;
  }

  // Print tree for debug
  public print(indent = 0): string {
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
          res += `+ ${p.content}[${p.parent?.name}](${p.index})\n`;
        } else {
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

  public saveLayout(): LayoutPanel {
    const p: LayoutPanel = {
      panels: [],
    };
    for (const panel of this.panels) {
      if (panel instanceof PanelGroup) {
        p.panels?.push(panel.saveLayout());
      } else if (panel instanceof PanelLeaf) {
        p.panels?.push({ content: panel.content });
      }
    }
    return p;
  }
}

export class PanelLeaf extends PanelNode {
  constructor(public content: PanelType) {
    super();
    this.parent = null;
  }
}
/**
 * This store house the last panel clicked by the user.
 */
class FocusedPanelStore {
  private readonly store = writable<number>(-1);

  public focusOnPanel(id: number) {
    this.store.set(id);
  }

  public get subscribe() {
    return this.store.subscribe;
  }
}

export const focusedPanelStore = new FocusedPanelStore();
