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

export type Action = { type: "addNode"; signature: string };

class ContextMenuStore {
  // Pixel Dimensions of Screen as numbers
  private screenDimensions = { width: 0, height: 0 };
  // Pixel Dimensions of Menu as numbers
  private menuDimensions = { width: 192, height: 256 };
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
    const deltaX = this.screenDimensions.width - width;
    const deltaY = this.screenDimensions.height - height;
    this.screenDimensions.width = width;
    this.screenDimensions.height = height;

    this.store.update((state) => {
      const { x, y } = state.cursorPos;
      state.cursorPos.x = x - deltaX;
      state.cursorPos.y = y - deltaY;
      return state;
    });
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

  private groupBy(nodes: INode[]): ItemGroup[] {
    const groups: Record<string, ItemGroup> = {};

    for (const node of nodes) {
      const parts = node.signature.split(".");
      const plugin = parts[0];

      if (!groups[plugin]) {
        groups[plugin] = {
          label: plugin,
          items: [],
        };
      }

      groups[plugin].items.push({
        label: node.title,
        icon: node.icon,
        action: {
          type: "addNode",
          signature: node.signature,
        },
      });
    }

    return Object.values(groups);
  }
}

export const graphMenuStore = new ContextMenuStore();
