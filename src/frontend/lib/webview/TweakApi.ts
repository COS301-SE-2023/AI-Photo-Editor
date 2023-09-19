import type { GraphNodeUUID, GraphUUID } from "../../../shared/ui/UIGraph";
import { GraphStore, graphMall } from "../stores/GraphStore";
import { get, type Readable } from "svelte/store";

export class TweakApi {
  private graphStore: Readable<GraphStore | null>;

  constructor(private graphUUID: GraphUUID) {
    this.graphStore = graphMall.getGraphReactive(graphUUID);
  }

  setUIInput(nodeUUID: GraphNodeUUID, inputId: string, value: any) {
    get(this.graphStore)?.updateUIInput(nodeUUID, inputId, value);
  }
}
