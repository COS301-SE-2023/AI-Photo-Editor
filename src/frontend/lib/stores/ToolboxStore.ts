import type { INode } from "@shared/ui/ToolboxTypes";
import { derived, writable } from "svelte/store";

type NodeSignature = string;
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
}

// export const graphMall = writable<GraphMall>(new GraphMall());
export const toolboxStore = new ToolboxStore();
