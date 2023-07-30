
import { CoreGraphExporter, GraphToJSON,GraphFileExportStrategy, YamlExportStrategy,LLMExportStrategy } from "../../../../../src/electron/lib/core-graph/CoreGraphExporter";
import { CoreGraph } from "../../../../../src/electron/lib/core-graph/CoreGraph";
import { MinAnchor, NodeInstance,InputAnchorInstance,OutputAnchorInstance } from "../../../../../src/electron/lib/registries/ToolboxRegistry";
import { before } from "node:test";





jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
  readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
  readdirSync: jest.fn(() => ["hello-plugin"]),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));



  describe("Test fileExporter", () => {
    let exporter : GraphFileExportStrategy;
    let graph : CoreGraph
    let node : NodeInstance;
    let node2 : NodeInstance;
    const inputs : MinAnchor[] = [];
    const outputs : MinAnchor[] = [];

    beforeEach(() => {
        exporter = new GraphFileExportStrategy();
        graph = new CoreGraph();

         node = new NodeInstance("jake", "plugin","plugin.jake","The jake plugin","1149", inputs, outputs);
         node2 = new NodeInstance("jake2", "plugin","plugin.jake2","The jake plugin2","1149", inputs, outputs);

        node.inputs.push(new InputAnchorInstance("number","aaaa","aaaa.number"));
        node2.outputs.push(new OutputAnchorInstance("number","bbbb","bbbb.number"));

        graph.addNode(node);
        graph.addNode(node2);

    });

    test("Initial exporter", () => {
        const graphexporter = new GraphFileExportStrategy();
        const result = graphexporter.export(graph);
        const exporter = new CoreGraphExporter(new GraphFileExportStrategy());

        expect(exporter).toBeDefined();

        expect(JSON.stringify(exporter.exportGraph(graph))).toBe(JSON.stringify(result));

    })

    test("Test constructor", () => {
      expect(exporter).toBeDefined();
    })

    test("Test nodesToJSon", () => {
        const json = exporter.nodesToJSON(graph);
        expect(json).toBeDefined();
        expect(json[0].signature).toBe("plugin.jake");
        expect(json[1].signature).toBe("plugin.jake2");

        expect(json.length).toBe(2);
    })

    test("Test edgesToJson",async () => {
        const json = exporter.edgesToJSON(graph);
        expect(json).toBeDefined();
        expect(json.length).toBe(0);

        let anchors : string[] = [];
        for(const key in graph.getAnchors){
            anchors.push(key);
        }

        const result = graph.addEdge(anchors[0], anchors[1]);
        const json2 = exporter.edgesToJSON(graph);
        expect(json2.length).toBe(1);
        expect(json2[0].anchorFrom.id).toBe("bbbb");
    })

    test("Test export", () => {
        const result = exporter.export(graph);
        expect(result.nodes).toEqual(exporter.nodesToJSON(graph));
        expect(result.edges).toEqual(exporter.edgesToJSON(graph));
    });

  });

    describe("Test YamlExportStrategy", () => {
        let exporter : YamlExportStrategy;
        let graph : CoreGraph;
        beforeEach(() => {
            exporter = new YamlExportStrategy();
            graph = new CoreGraph();
        });

        test("Test constructor", () => {
            expect(exporter).toBeDefined();
        })

        test("Test export", () => {
            expect(() => exporter.export(graph)).toThrow()
        })

    })

    describe("Test LLM exporter", () => {
        let exporter : LLMExportStrategy;
        let graph : CoreGraph;

        beforeEach(() => {
            exporter = new LLMExportStrategy();
            graph = new CoreGraph();
        });

        test("Test constructor", () => {
            expect(exporter).toBeDefined();
        })

        test("Test export", () => {
            const node = new NodeInstance("jake", "plugin","plugin.jake","The jake plugin","1149", [], []);
            const node2 = new NodeInstance("jake2", "plugin","plugin.jake2","The jake plugin2","1149", [], []);


            node.inputs.push(new InputAnchorInstance("number","aaaa","aaaa.number"));
            node2.outputs.push(new OutputAnchorInstance("number","bbbb","bbbb.number"));

            graph.addNode(node);
            graph.addNode(node2);

            let anchors : string[] = [];
            for(const key in graph.getAnchors){
                anchors.push(key);
            }

            const result = graph.addEdge(anchors[0], anchors[1]);

            const json = exporter.export(graph);
            expect(json).toBeDefined();
            expect(json.graph.nodes).toBeDefined();
            expect(json.graph.nodes.length).toBe(2);
            expect(json.graph.edges.length).toBe(1);
        })

    });