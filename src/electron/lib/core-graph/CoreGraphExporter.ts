import type { UIValue } from "../../../shared/types";
import { type AnchorUUID, CoreGraph, AnchorIO, CoreNodeUIInputs } from "./CoreGraph";
import { NodeStyling } from "./CoreGraph";
import type { SvelvetCanvasPos } from "../../../shared/ui/UIGraph";

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
export type NodeToJSON = {
  signature: string;
  position: SvelvetCanvasPos;
  inputs: { [key: string]: UIValue };
};
export type AnchorToJSON = { parent: number; id: string };
export type EdgeToJSON = { anchorFrom: AnchorToJSON; anchorTo: AnchorToJSON };

export class GraphFileExportStrategy implements ExportStrategy<GraphToJSON> {
  export(graph: CoreGraph): GraphToJSON {
    // console.log(this.nodesToJSON(graph));
    return { nodes: this.nodesToJSON(graph), edges: this.edgesToJSON(graph) };
  }

  nodesToJSON(graph: CoreGraph): NodeToJSON[] {
    const inputs = graph.getAllUIInputs;
    const json: NodeToJSON[] = [];
    for (const node in graph.getNodes) {
      if (!graph.getNodes.hasOwnProperty(node)) continue;
      json.push({
        signature: `${graph.getNodes[node].getPlugin}.${graph.getNodes[node].getName}`,
        position: graph.getUIPositions()[node],
        inputs: inputs[node].getInputs,
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
            parent: Object.keys(graph.getNodes).indexOf(graph.getAnchors[anchorFrom].parent.uuid),
            id: graph.getAnchors[anchorFrom].getAnchorId(),
          },
          anchorTo: {
            parent: Object.keys(graph.getNodes).indexOf(graph.getAnchors[anchorTo].parent.uuid),
            id: graph.getAnchors[anchorTo].getAnchorId(),
          },
        });
      }
    }
    return json;
  }
}
export class YamlExportStrategy implements ExportStrategy<string> {
  export(graph: CoreGraph): string {
    throw Error("YamlExportStrategy not implemented");
  }
}

export type LLMGraph = {
  graph: {
    nodes: {
      id: string;
      signature: string;
      inputs: {
        id: string;
        type: string;
      }[];
      outputs: {
        id: string;
        type: string;
      }[];
      inputValues: Record<string, UIValue>;
    }[];
    edges: {
      id: string;
      input: string;
      output: string;
    }[];
  };
  nodeMap: Record<string, string>;
  edgeMap: Record<string, string>;
  anchorMap: Record<string, string>;
};

export class LLMExportStrategy implements ExportStrategy<LLMGraph> {
  export(graph: CoreGraph): LLMGraph {
    const llmGraph: LLMGraph = {
      graph: {
        nodes: [],
        edges: [],
      },
      nodeMap: {},
      edgeMap: {},
      anchorMap: {},
    };
    // Nodes
    Object.values(graph.getNodes).forEach((n) => {
      const node: LLMGraph["graph"]["nodes"][0] = {
        id: n.uuid.slice(0, 6),
        signature: n.getSignature,
        inputs: [],
        outputs: [],
        inputValues: {},
      };
      // Anchors for Node
      Object.values(n.getAnchors).forEach((a) => {
        if (a.ioType === AnchorIO.input) {
          node.inputs.push({ id: a.uuid.slice(0, 6), type: a.type });
        } else if (a.ioType === AnchorIO.output) {
          node.outputs.push({ id: a.uuid.slice(0, 6), type: a.type });
        }
        llmGraph.anchorMap[a.uuid.slice(0, 6)] = a.uuid;
      });
      llmGraph.graph.nodes.push(node);
      llmGraph.nodeMap[n.uuid.slice(0, 6)] = n.uuid;
      node.inputValues = graph.getUIInputs(n.uuid) || {};
    });
    // Edges
    Object.values(graph.getEdgeDest).forEach((e) => {
      llmGraph.graph.edges.push({
        id: e.uuid.slice(0, 6),
        input: e.getAnchorTo.slice(0, 6),
        output: e.getAnchorFrom.slice(0, 6),
      });
      llmGraph.edgeMap[e.uuid.slice(0, 6)] = e.uuid;
    });

    return llmGraph;
  }
}
