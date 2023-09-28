import {
  CoreGraphExporter,
  GraphToJSON,
  GraphFileExportStrategy,
  YamlExportStrategy,
  LLMExportStrategy,
  LLMGraph,
  BlypescriptExportStrategy,
} from "../../../../../src/electron/lib/core-graph/CoreGraphExporter";
import { AnchorIO, CoreGraph } from "../../../../../src/electron/lib/core-graph/CoreGraph";
import {
  MinAnchor,
  NodeInstance,
  InputAnchorInstance,
  OutputAnchorInstance,
  ToolboxRegistry,
} from "../../../../../src/electron/lib/registries/ToolboxRegistry";
import { before } from "node:test";
import { QueryResponse } from "../../../../../src/shared/types";
import { UUID } from "../../../../../src/shared/utils/UniqueEntity";
import { BlypescriptProgram, BlypescriptToolbox } from "../../../../../src/electron/lib/ai/AiLang";
import { createOutputNode } from "../../../../../src/electron/lib/Blix";
import { join } from "path";
import { readFileSync, readdirSync } from "fs";
import { PackageData } from "../../../../../src/electron/lib/plugins/PluginManager";
import { Plugin, NodePluginContext } from "../../../../../src/electron/lib/plugins/Plugin";

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
  readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
  readdirSync: jest.fn(() => ["hello-plugin"]),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe("Test graphExporter", () => {
  let exporter: CoreGraphExporter<GraphToJSON>;
  let graph: CoreGraph;
  let node1: NodeInstance;
  let node2: NodeInstance;
  let inputs1: MinAnchor[] = [];
  let inputs2: MinAnchor[] = [];
  let outputs1: MinAnchor[] = [];
  let outputs2: MinAnchor[] = [];

  beforeEach(() => {
    exporter = new CoreGraphExporter<GraphToJSON>(new GraphFileExportStrategy());
    graph = new CoreGraph();

    inputs1 = [];
    inputs2 = [];
    outputs1 = [];
    outputs2 = [];

    inputs1.push(
      { type: "string", displayName: `Test-plugin.Node-1.0`, identifier: `in1` },
      { type: "string", displayName: `Test-plugin.Node-1.1`, identifier: `in2` },
      { type: "string", displayName: `Test-plugin.Node-1.2`, identifier: `in3` }
    );

    outputs1.push(
      { type: "string", displayName: `Test-plugin.Node-1.3`, identifier: `out1` },
      { type: "number", displayName: `Test-plugin.Node-1.4`, identifier: `out2` }
    );

    inputs2.push(
      { type: "string", displayName: `Test-plugin.Node-2.0`, identifier: `in1` },
      { type: "string", displayName: `Test-plugin.Node-2.1`, identifier: `in2` },
      { type: "string", displayName: `Test-plugin.Node-2.2`, identifier: `in3` }
    );

    outputs2.push(
      { type: "string", displayName: `Test-plugin.Node-2.3`, identifier: `out1` },
      { type: "number", displayName: `Test-plugin.Node-2.4`, identifier: `out2` }
    );

    node1 = new NodeInstance(
      "Node-1",
      "Test-Plugin",
      "folder",
      "Node 1",
      "This is node 1",
      "fa-bell",
      inputs1,
      outputs1
    );
    node2 = new NodeInstance(
      "Node-2",
      "Test-Plugin",
      "folder",
      "node 2",
      "This is node 2",
      "fa-bell",
      inputs2,
      outputs2
    );

    let response: QueryResponse<{ nodeId: UUID }> = graph.addNode(node1, { x: 0, y: 0 });
    const uuid1 = (response.data! as { nodeId: UUID }).nodeId;
    response = graph.addNode(node2, { x: 0, y: 0 });
    const uuid2 = (response.data! as { nodeId: UUID }).nodeId;

    // Get Node objects from graph
    const actualNode1 = graph.getNodes[uuid1];
    const actualNode2 = graph.getNodes[uuid2];

    // Add edge
    const anchorFrom: UUID = Object.keys(actualNode1.getAnchors)[3]; // output
    const anchorTo: UUID = Object.keys(actualNode2.getAnchors)[0]; // input
    let result: QueryResponse<{ edgeId: string }> = graph.addEdge(anchorFrom, anchorTo);
  });

  test("Export CoreGraph to JSON format", () => {
    const json: GraphToJSON = exporter.exportGraph(graph);
    const format: GraphToJSON = {
      nodes: [
        {
          signature: "Test-Plugin.Node-1",
          position: { x: 0, y: 0 },
          inputs: {},
        },
        {
          signature: "Test-Plugin.Node-2",
          position: { x: 0, y: 0 },
          inputs: {},
        },
      ],
      edges: [
        {
          anchorFrom: {
            parent: 0,
            id: "out1",
          },
          anchorTo: {
            parent: 1,
            id: "in1",
          },
        },
      ],
    };
    expect(json).toStrictEqual(format);
  });

  test("Export CoreGraph to YAML format", () => {
    let exporter2: CoreGraphExporter<string>;
    exporter2 = new CoreGraphExporter<string>(new YamlExportStrategy());
    expect(() => exporter2.exportGraph(graph)).toThrow("YamlExportStrategy not implemented");
  });

  test("Export CoreGraph to LLM format", () => {
    let exporter2: CoreGraphExporter<LLMGraph>;
    exporter2 = new CoreGraphExporter<LLMGraph>(new LLMExportStrategy());
    const json: LLMGraph = exporter2.exportGraph(graph);
    // console.log(JSON.stringify(json,null,2))
    let llmGraph: LLMGraph = {
      graph: {
        nodes: [],
        edges: [],
      },
      nodeMap: {},
      edgeMap: {},
      anchorMap: {},
    };

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

    expect(llmGraph).toStrictEqual(json);
  });

  test("Exporting nodes and edges to JSON format", () => {
    let exporter2 = new GraphFileExportStrategy();

    const edges = exporter2.edgesToJSON(graph);
    const nodes = exporter2.nodesToJSON(graph);

    // console.log(edges)

    const nodeFormat = [
      {
        signature: "Test-Plugin.Node-1",
        position: { x: 0, y: 0 },
        inputs: {},
      },
      {
        signature: "Test-Plugin.Node-2",
        position: { x: 0, y: 0 },
        inputs: {},
      },
    ];

    const edgeformat = [
      {
        anchorFrom: {
          parent: 0,
          id: "out1",
        },
        anchorTo: {
          parent: 1,
          id: "in1",
        },
      },
    ];

    expect(nodes).toStrictEqual(nodeFormat);
    expect(edges).toStrictEqual(edgeformat);
  });
});
