import { ToolboxRegistry } from "../registries/ToolboxRegistry";
import { type AnchorUUID, CoreGraph } from "./CoreGraph";
import { NodeStyling } from "./CoreGraph";

/**
 * This class is used to export a CoreGraph to external representations
 */
export class CoreGraphExporter<T> {
  constructor(private exporter: ExportStrategy<T>) {}

  exportGraph(graph: CoreGraph): T {
    return this.exporter.export(graph);
  }
}

interface ExportStrategy<T> {
  export(graph: CoreGraph): T;
}

export type GraphToJSON = { nodes: NodeToJSON[]; edges: EdgeToJSON[] };
export type NodeToJSON = { signature: string; styling: NodeStyling | null };
export type AnchorToJSON = { parent: number; id: number };
export type EdgeToJSON = {
  anchorFrom: AnchorToJSON;
  anchorTo: AnchorToJSON;
};

export class GraphFileExportStrategy implements ExportStrategy<GraphToJSON> {
  export(graph: CoreGraph): GraphToJSON {
    return { nodes: this.nodesToJSON(graph), edges: this.edgesToJSON(graph) };
  }

  nodesToJSON(graph: CoreGraph): NodeToJSON[] {
    const json: NodeToJSON[] = [];
    for (const node in graph.getNodes) {
      if (!graph.getNodes.hasOwnProperty(node)) continue;
      json.push({
        signature: `${graph.getNodes[node].getPlugin}.${graph.getNodes[node].getName}`,
        styling: graph.getNodes[node].getStyling,
      });
    }

    return json;
  }

  edgesToJSON(graph: CoreGraph): EdgeToJSON[] {
    const json: EdgeToJSON[] = [];
    for (const anchorFrom in graph.getEdgeSrc) {
      if (!graph.getEdgeSrc.hasOwnProperty(anchorFrom)) continue;
      const anchorTos: AnchorUUID[] = graph.getEdgeSrc[anchorFrom];
      for (const anchorTo of anchorTos) {
        json.push({
          anchorFrom: {
            parent: Object.keys(graph.getNodes).indexOf(
              graph.getAnchors[anchorFrom].getParent.uuid
            ),
            id: graph.getAnchors[anchorFrom].getLocalAnchorId,
          },
          anchorTo: {
            parent: Object.keys(graph.getNodes).indexOf(graph.getAnchors[anchorTo].getParent.uuid),
            id: graph.getAnchors[anchorTo].getLocalAnchorId,
          },
        });
      }
    }
    return json;
  }
}

class YamlExportStrategy implements ExportStrategy<string> {
  export(graph: CoreGraph): string {
    throw Error("YamlExportStrategy not implemented");
  }
}
