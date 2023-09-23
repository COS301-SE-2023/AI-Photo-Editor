// N-way tree of panels

import type { LayoutPanel, PanelType } from "../../shared/types/index";
import { writable } from "svelte/store";
/* eslint-disable no-console */
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

  /**
   * Removes a panel to from the panelgroup at index i. Existing panelGroup will be pruned if only one panel exists.
   * @param i The index to remove the panel from
   * @returns void
   * */

  // Nukes the current panelgroup and replaces it with its first child if possible
  removePanel(i: number) {
    if (i > this.panels.length) console.warn("PanelGroup.removePanel: Index out of bounds : ", i);
    this.panels.splice(i, 1);

    // If length 1, dissolve and replace with child
    if (this.panels.length === 1) {
      if (this.parent != null) {
        this.parent.setPanel(this.panels[0], this.index); // Replaces
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

  /**
   * Replaces a panel at the designated index in the panelgroup.
   * @param panel The panel to be used to replace the existing panel
   * @param i The index of the panel to be replaced
   * @returns void
   * */

  setPanel(panel: PanelNode, i: number) {
    if (i > this.panels.length) {
      console.warn("PanelGroup.setPanel: Index out of bounds : ", i);
      return;
    }
    const tempId = this.panels[i].id;
    this.panels[i] = panel;
    panel.parent = this;
    panel.index = i;
    panel.id = tempId;
  }

  /**
   * Inserts a panel to the panelgroup at index i
   * @param content The type of the panel to be added
   * @param i The index to place the panel at
   * @returns void
   * */

  addPanel(content: PanelType, i: number) {
    const newLeaf = new PanelLeaf(content);
    if (i > this.panels.length) console.warn("PanelGroup.addPanel: Index out of bounds : ", i);
    this.panels.splice(i, 0, newLeaf);
    newLeaf.parent = this;
    newLeaf.index = i;

    this.updateParent(this);
  }

  /**
   * Inserts a panelgroup to the current panelgroup at index i
   * @param panelGroup The panelgroup to be added
   * @param i The index to place the panelgroup at
   * @returns void
   * */

  addPanelGroup(panelGroup: PanelGroup, i: number) {
    this.panels.splice(i, 0, panelGroup);
    panelGroup.parent = this;
    panelGroup.index = i;
  }

  /**
   * Returns the panel at the designated index
   * @param i The index of the panel to be returned
   * @returns PanelNode
   * */
  getPanel(i: number): PanelNode {
    return this.panels[i];
  }

  /**
   * Updates the parent of the current panelgroup
   * @param _current The current panel group to be used
   * @returns void
   * */

  updateParent(_current: PanelGroup) {
    let current = _current;
    while (current.parent != null) {
      current = current.parent;
    }
    current = current;
  }

  /**
   * Prints the panelgroup and its children
   * @param indent The indentation level to be used
   * @returns string
   */

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

  /**
   * Recursively sets the parent of the panelgroup and its children
   * @returns void
   * */

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

  /**
   * Saves the layout of the panelgroup and its children
   * @returns LayoutPanel
   * */

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
  private readonly store = writable<number>(-1);

  public focusOnPanel(id: number) {
    this.store.set(id);
  }

  public get subscribe() {
    return this.store.subscribe;
  }
}

export const focusedPanelStore = new FocusedPanelStore();

/* eslint-enable no-console */
