import { writable } from "svelte/store";
export type Coordinates = {
  x: number;
  y: number;
};

export type ContextMenuState = {
  isShowing: boolean;
  windowPos: Coordinates;
  canvasPos: Coordinates;
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
  private readonly store = writable<ContextMenuState>({
    isShowing: false,
    windowPos: { x: 0, y: 0 },
    canvasPos: { x: 0, y: 0 },
    items: [],
  });

  public get subscribe() {
    return this.store.subscribe;
  }

  public showMenu(state: ContextMenuState) {
    // console.log("setting menu", state)
    this.store.set(state);
  }

  public hideMenu() {
    this.store.set({
      isShowing: false,
      windowPos: { x: 0, y: 0 },
      canvasPos: { x: 0, y: 0 },
      items: [],
    });
  }

  public toggle() {
    this.store.update((state) => {
      state.isShowing = !state.isShowing;
      return state;
    });
  }
}

export const graphNodeMenuStore = new ContextMenuStore();
