import { writable, get } from "svelte/store";
import { toolboxStore } from "./ToolboxStore";
import { INode } from "@shared/ui/ToolboxTypes";

export type ContextMenuState = {
  isShowing: boolean;
  cursorPos: Coordinates;
  canvasPos: Coordinates;
  graphId: string;
  items: (ItemGroup | Item)[];
};

export type Coordinates = {
  x: number;
  y: number;
};

export type ItemGroup = {
  label: string;
  items: (ItemGroup | Item)[];
};

export type Item = {
  label: string;
  icon?: string;
  action: Action;
};

function isItemGroup(item: ItemGroup | Item): item is ItemGroup {
  return "items" in item;
}

export type Action = { type: "addNode"; signature: string };

class ContextMenuStore {
  // Pixel Dimensions of Screen as numbers
  private screenDimensions = { width: 0, height: 0 };
  // Pixel Dimensions of Menu as numbers
  private menuDimensions = { width: 192, height: 240 };
  // Pixel count Padding between Menu and Screen as number
  private screenPadding = 15;

  private readonly store = writable<ContextMenuState>({
    isShowing: false,
    cursorPos: { x: 0, y: 0 },
    canvasPos: { x: 0, y: 0 },
    graphId: "",
    items: [],
  });

  /**
   * This function is used to set the screen dimensions
   *
   * @param width New screen width
   * @param height New screen height
   */
  public setScreenDimensions(width: number, height: number) {
    this.screenDimensions.width = width;
    this.screenDimensions.height = height;

    // Hides menu when window gets resized
    this.hideMenu();
  }

  public get subscribe() {
    return this.store.subscribe;
  }

  /**
   * This function sets the state of the menu before is is shown to the user
   * Before is is shown the current coordinates of the top left corner of the menu are checked
   * incase the menu could overflow the sceen when shown. Overflow is Checked for all side of the screen.
   * Once check and potentially adjusted, the menu state is set
   *
   * @param state State of menu to be shown
   */
  public showMenu(cursorPos: Coordinates, canvasPos: Coordinates, graphId: string) {
    const toolbox = get(toolboxStore);
    const menuNodes = this.groupBy(Object.values(toolbox));

    // Max Length and height of current application screen
    // 1 - Recalculate menu position for horizontal overflow - Right Border
    // 2 - Recalculate menu position for vertical overflow - Left border
    if (
      cursorPos.x + this.menuDimensions.width + this.screenPadding >
      this.screenDimensions.width
    ) {
      cursorPos.x = this.screenDimensions.width - this.menuDimensions.width - this.screenPadding;
    } else if (cursorPos.x - this.screenPadding < 0) {
      cursorPos.x = this.screenPadding;
    }
    // 1 - Recalculate menu position for vertical overflow - Bottom Border
    // 2 - Recalculate menu position for horizontal overflow - Top border
    if (
      cursorPos.y + this.menuDimensions.height + this.screenPadding >
      this.screenDimensions.height
    ) {
      cursorPos.y = this.screenDimensions.height - this.menuDimensions.height - this.screenPadding;
    } else if (cursorPos.y - this.screenPadding < 0) {
      cursorPos.y = this.screenPadding;
    }

    this.store.set({
      isShowing: true,
      cursorPos,
      canvasPos,
      graphId,
      items: menuNodes,
    });
  }

  public hideMenu() {
    this.store.update((state) => {
      state.isShowing = false;
      state.items = [];
      return state;
    });
  }

  /**
   * This function will show and hide the menu
   */
  public toggle() {
    this.store.update((state) => {
      state.isShowing = !state.isShowing;
      return state;
    });
  }

  // Construct item group tree from nodes
  private groupBy(nodes: INode[]): ItemGroup[] {
    const res: ItemGroup[] = [];

    for (const node of nodes) {
      // Split by non-escaped forward slashes
      const folderParts = node.folder
        .replace(/\\/g, "\0") // Eliminate escaped backslashes
        .split(/(?<!\\)\//) // Split by non-escaped forward slashes
        .map((part) =>
          part
            .replace(/\\\//g, "/") // Unescape remaining forward slashes
            .replace(/\0/g, "\\") // Unescape backslashes
            .trim()
        );

      // Construct folder hierarchy
      let elems: (ItemGroup | Item)[] = res;
      construct: for (const folder of folderParts) {
        if (folder === "") continue;

        // Check if folder is already in the hierarchy
        for (const elem of elems) {
          if (!isItemGroup(elem)) continue; // Skip non-groups

          if (elem.label === folder) {
            // Folder already exists
            elems = elem.items;
            continue construct;
          }
        }

        // Folder does not exist, construct it
        const newGroup: ItemGroup = {
          label: folder,
          items: [],
        };
        elems.push(newGroup);

        elems = newGroup.items as ItemGroup[];
      }

      // Add node to folder (item to group)
      elems.push({
        label: node.title,
        icon: node.icon,
        action: {
          type: "addNode",
          signature: node.signature,
        },
      });
    }

    return res;
  }
}

export const graphMenuStore = new ContextMenuStore();
