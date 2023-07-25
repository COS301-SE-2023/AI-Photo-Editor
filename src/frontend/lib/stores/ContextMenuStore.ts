import { writable } from "svelte/store";
export type Coordinates = {
  x: number;
  y: number;
};

export type ContextMenuState = {
  isShowing: boolean;
  windowPos: Coordinates;
  canvasPos: Coordinates;
  graphId: string;
  items: (ItemGroup | Item)[];
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

export type CustomEvent = { action: Item };
export type Action = { type: "addNode"; signature: string };

class ContextMenuStore {
  // Pixel Dimensions of Screen as numbers
  private screenDimensions = { width: 0, height: 0 };
  // Pixel Dimensions of Menu as numbers
  private menuDimensions = { width: 192, height: 259 };
  // Pixel count Padding between Menu and Screen as number
  private screenPadding = 15;

  private readonly store = writable<ContextMenuState>({
    isShowing: false,
    windowPos: { x: 0, y: 0 },
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
  public showMenu(state: ContextMenuState) {
    // Max Length and height of current application screen
    const { windowPos } = state;
    // 1 - Recalculate menu position for horizontal overflow - Right Border
    // 2 - Recalculate menu position for vertical overflow - Left border
    if (
      windowPos.x + this.menuDimensions.width + this.screenPadding >
      this.screenDimensions.width
    ) {
      state.windowPos.x =
        this.screenDimensions.width - this.menuDimensions.width - this.screenPadding;
    } else if (windowPos.x - this.screenPadding < 0) {
      state.windowPos.x = this.screenPadding;
    }
    // 1 - Recalculate menu position for vertical overflow - Bottom Border
    // 2 - Recalculate menu position for horizontal overflow - Top border
    if (
      windowPos.y + this.menuDimensions.height + this.screenPadding >
      this.screenDimensions.height
    ) {
      state.windowPos.y =
        this.screenDimensions.height - this.menuDimensions.height - this.screenPadding;
    } else if (windowPos.y - this.screenPadding < 0) {
      state.windowPos.y = this.screenPadding;
    }
    this.store.set(state);
  }
  /**
   * This function will rest the state of the menu to its default values
   */
  public hideMenu() {
    this.store.set({
      isShowing: false,
      windowPos: { x: 0, y: 0 },
      canvasPos: { x: 0, y: 0 },
      graphId: "",
      items: [],
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
}

export const graphNodeMenuStore = new ContextMenuStore();
