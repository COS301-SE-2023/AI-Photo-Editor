// N-way tree of panels

import type { LayoutPanel, PanelType } from "../../shared/types/index";
import { writable } from "svelte/store";
/* eslint-disable no-console */
export abstract class PanelNode {
  static panelCounter = 0;
  parent: PanelGroup | null;
  index: number;
  // Helps Svelte with keying, cannot contain '_' character because it is used
  // for string splitting in Graph.svelte
  id: string;
  size?: number;

  constructor() {
    this.parent = null;
    this.index = -1;
    this.id = PanelNode.generateUniqueId();
  }

  static generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const randomNumber = Math.random().toString(36).substring(2, 8);
    const uniqueId = timestamp + randomNumber;
    return uniqueId;
  }
}

// Always has a minimum of two children, or self-destructs
export class PanelGroup extends PanelNode {
  static groupCounter = 0;

  name: string;
  panels: PanelNode[] = [];

  // A custom name can optionally be provided
  constructor(name = "") {
    super();

    if (name !== "") {
      this.name = name;
    } else {
      this.name = `pg_${PanelGroup.groupCounter}`;
    }

    PanelGroup.groupCounter++;
  }

  /**
   * Removes a panel at a designated index in the PanelGroup. If the PanelGroup
   * has only one child, it will be replaced by the child.
   *
   * @param index The index of the panel to be removed
   */
  removePanel(index: number) {
    if (index < 0 || index >= this.panels.length) {
      return;
    }

    this.panels.splice(index, 1);

    // Nukes the current PanelGroup and replaces it with its first child
    if (this.panels.length === 1) {
      this.parent?.setPanel(this.panels[0], this.index);
    }

    // If empty, dissolve (Shouldn't ever happen anyway)
    if (this.panels.length === 0) {
      this.parent?.removePanel(this.index);
    }

    this.updatePanelIndexes();
    this.updateParent(this);
  }

  /**
   * Replaces a panel at the designated index in the PanelGroup.
   *
   * @param panel The panel to be used to replace the existing panel
   * @param index The index of the panel to be replaced
   */
  setPanel(panel: PanelNode, index: number) {
    if (index < 0 || index >= this.panels.length) {
      return;
    }

    this.panels[index] = panel;
    panel.parent = this;
    panel.index = index;
  }

  /**
   * Inserts a panel at the designated index in the PanelGroup. If the index is
   * not provided, the panel will be added to the end of the PanelGroup.
   *
   * @param content The type of the panel to be added
   * @param index The index to place the panel at
   */
  addPanel(content: PanelType, index?: number) {
    index = index ?? this.panels.length;

    if (index < 0 || index > this.panels.length) {
      return;
    }

    const newLeaf = new PanelLeaf(content);

    this.panels.splice(index, 0, newLeaf);
    newLeaf.parent = this;
    newLeaf.index = index;

    this.updateParent(this);
  }

  /**
   * Inserts a PanelGroup at the designated index in the PanelGroup. If the
   * index is not provided, thee PanelGroup will be added to the end of the
   * PanelGroup.
   *
   * @param panelGroup The PanelGroup to be added
   * @param index The index to place the PanelGroup at
   */
  addPanelGroup(panelGroup: PanelGroup, index?: number) {
    index = index ?? this.panels.length;

    if (index < 0 || index > this.panels.length) {
      return;
    }

    this.panels.splice(index, 0, panelGroup);
    panelGroup.parent = this;
    panelGroup.index = index;
  }

  getPanel(index: number): PanelNode {
    return this.panels[index];
  }

  updateParent(_current: PanelGroup) {
    let current = _current;

    while (current.parent != null) {
      current = current.parent;
    }

    current = current;
  }

  /** Print tree for debug */
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

  updatePanelIndexes() {
    this.panels.forEach((panel, index) => {
      panel.index = index;
    });
  }

  /** Recursively sets the parent of the PanelGroup and its children */
  recurseParent() {
    this.panels.forEach((panel, index) => {
      panel.parent = this;
      panel.index = index;

      if (panel instanceof PanelGroup) {
        panel.recurseParent();
      }
    });
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

/**
 * A leaf node that contains the type of the panel
 * @extends PanelNode
 */
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
  private readonly store = writable<string>("");

  public focusOnPanel(id: string) {
    this.store.set(id);
  }

  public get subscribe() {
    return this.store.subscribe;
  }
}

export const focusedPanelStore = new FocusedPanelStore();

/* eslint-enable no-console */
