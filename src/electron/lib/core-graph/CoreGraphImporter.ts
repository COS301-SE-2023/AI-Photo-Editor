import { type UUID } from "../../../shared/utils/UniqueEntity";
import { NodeInstance, ToolboxRegistry } from "../registries/ToolboxRegistry";
import { CoreGraph } from "./CoreGraph";
import { type AnchorToJSON, type GraphToJSON } from "./CoreGraphExporter";

export class CoreGraphImporter {
  private _toolbox: ToolboxRegistry;
  constructor(toolbox: ToolboxRegistry) {
    this._toolbox = toolbox;
  }
  /**
   * This will decide how the graph must be imported according to its format.
   * The casting is dumby for now until types are created for future formats.
   *
   *
   * @param format
   * @param data
   * @returns
   */
  import(format: string, data: string | GraphToJSON): CoreGraph {
    switch (format) {
      // case "yaml":
      //   return this.importYAML(data as string);
      // case "xml":
      //   return this.importXML(data as string);
      case "json":
        return this.importJSON(data as GraphToJSON);
      default:
        return new CoreGraph();
    }
  }

  // ===============================================
  // YAML
  // ===============================================

  // importYAML(graph: string) {
  //   return new CoreGraph();
  // }

  // ===============================================
  // XML
  // ===============================================

  // importXML(graph: string) {
  //   return new CoreGraph();
  // }

  // ===============================================
  // JSON
  // ===============================================

  importJSON(json: GraphToJSON): CoreGraph {
    const graph: CoreGraph = new CoreGraph();
    let cnt = 0;
    const nodes: { [key: number]: UUID } = {};
    for (const node of json.nodes) {
      const nodeInstance: NodeInstance = this._toolbox.getNodeInstance(node.signature);
      const res = graph.addNode(nodeInstance, node.position, node.inputs);
      if (res.status === "success" && res.data) {
        nodes[cnt++] = res.data?.nodeId;
      }
    }
    for (const edge of json.edges) {
      const anchorFrom = this.findCorrectAnchor(graph, nodes, edge.anchorFrom);
      const anchorTo = this.findCorrectAnchor(graph, nodes, edge.anchorTo);
      graph.addEdge(anchorFrom, anchorTo);
    }
    return graph;
  }

  findCorrectAnchor(graph: CoreGraph, nodes: { [key: UUID]: UUID }, anchor: AnchorToJSON): UUID {
    let result = "";
    const node = graph.getNodes[nodes[anchor.parent]];
    Object.keys(node.getAnchors).forEach((key) => {
      if (node.getAnchors[key].anchorId === anchor.id) {
        result = node.getAnchors[key].uuid;
      }
    });
    return result;
  }
}
