import type { INode, NodeSignature } from "@shared/ui/ToolboxTypes";
import { derived, get, writable } from "svelte/store";

type ToolboxDict = { [key: NodeSignature]: INode };

class ToolboxStore {
  private store = writable<ToolboxDict>({});

  public refreshStore(nodes: INode[]) {
    this.store.update((toolbox) => {
      for (const node of nodes) {
        toolbox[node.signature] = node;
      }
      return toolbox;
    });
    // console.log("REFRESH TOOLBOX", nodes);
  }

  public get subscribe() {
    return this.store.subscribe;
  }

  public getAllSignaturesReactive() {
    return derived(this.store, (toolbox) => {
      return Object.keys(toolbox);
    });
  }

  // Returns a derived store containing only the specified INode
  public getNodeReactive(signature: NodeSignature) {
    return derived(this.store, (toolbox) => {
      return toolbox[signature];
    });
  }

  public getNode(signature: NodeSignature) {
    return get(this.store)[signature];
  }
}

// export const graphMall = writable<GraphMall>(new GraphMall());
export const toolboxStore = new ToolboxStore();
