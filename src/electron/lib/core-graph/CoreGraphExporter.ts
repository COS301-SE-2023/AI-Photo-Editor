import { ToolboxRegistry } from "../registries/ToolboxRegistry";
import { type AnchorUUID, CoreGraph } from "./CoreGraph";
import { NodeStyling } from "./CoreGraph";

export type NodeToJSON = { signature: string; styling: NodeStyling | null };
export type AnchorToJSON = { parent: string; id: string };
export type EdgeToJSON = {
  anchorFrom: AnchorToJSON;
  anchorTo: AnchorToJSON;
};

export type GraphToJSON = { nodes: NodeToJSON[]; edges: EdgeToJSON[] };

/**
 * This class is used to export a CoreGraph to external representations
 */
export class CoreGraphExporter {
  export(format: string, graph: CoreGraph): any {
    switch (format) {
      case "yaml":
        return this.exportYAML(graph);
      case "xml":
        return this.exportXML(graph);
      case "json":
        return this.exportJSON(graph);
      default:
        return "";
    }
  }

  // ===============================================
  // YAML
  // ===============================================

  exportYAML(graph: CoreGraph): string {
    return "";
  }

  // ===============================================
  // XML
  // ===============================================

  exportXML(graph: CoreGraph): string {
    return "";
  }

  // ===============================================
  // JSON
  // ===============================================

  exportJSON(graph: CoreGraph): GraphToJSON {
    return { nodes: this.nodesToJSON(graph), edges: this.edgesToJSON(graph) };
  }

  nodesToJSON(graph: CoreGraph): NodeToJSON[] {
    const json: NodeToJSON[] = [];
    for (const node in graph.getNodes) {
      if (!graph.getNodes.hasOwnProperty(node)) continue;
      json.push({
        signature: `${graph.getNodes[node].getPlugin}.${graph.getNodes[node].getName}`,
        styling: graph.getNodes[node].getStyling || null,
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
            parent: graph.getAnchors[anchorFrom].parent.uuid,
            id: graph.getAnchors[anchorFrom].anchorId,
          },
          anchorTo: {
            parent: graph.getAnchors[anchorTo].parent.uuid,
            id: graph.getAnchors[anchorTo].anchorId,
          },
        });
      }
    }
    return json;
  }
}
