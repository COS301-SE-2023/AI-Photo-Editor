import type { ITile, TileSignature } from "@shared/ui/TileUITypes";
import { derived, get, writable } from "svelte/store";

type TileDict = { [key: TileSignature]: ITile };

class TileStore {
  private store = writable<TileDict>({});

  public refreshStore(tiles: ITile[]) {
    this.store.update((dict) => {
      for (const tile of tiles) {
        dict[tile.signature] = tile;
      }
      return dict;
    });
    // console.log("REFRESH TOOLBOX", nodes);
  }

  public get subscribe() {
    return this.store.subscribe;
  }

  public getAllSignaturesReactive() {
    return derived(this.store, (dict) => {
      return Object.keys(dict);
    });
  }

  // Returns a derived store containing only the specified INode
  public getTileReactive(signature: TileSignature) {
    return derived(this.store, (dict) => {
      return dict[signature];
    });
  }

  public getNode(signature: TileSignature) {
    return get(this.store)[signature];
  }
}

// export const graphMall = writable<GraphMall>(new GraphMall());
export const tileStore = new TileStore();
