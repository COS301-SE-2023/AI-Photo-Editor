import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createOutputNode } from "../../../../../src/electron/lib/Blix";
import {
  BlypescriptInterpreter,
  BlypescriptProgram,
  BlypescriptToolbox,
} from "../../../../../src/electron/lib/ai/AiLang";
import { CoreGraph } from "../../../../../src/electron/lib/core-graph/CoreGraph";
import {
  BlypescriptExportStrategy,
  CoreGraphExporter,
} from "../../../../../src/electron/lib/core-graph/CoreGraphExporter";
import { CoreGraphManager } from "../../../../../src/electron/lib/core-graph/CoreGraphManager";
import { NodePluginContext, Plugin } from "../../../../../src/electron/lib/plugins/Plugin";
import { PackageData } from "../../../../../src/electron/lib/plugins/PluginManager";
import { ToolboxRegistry } from "../../../../../src/electron/lib/registries/ToolboxRegistry";

describe("Blypescript parser", () => {
  test("should parse an empty graph", () => {
    const result = BlypescriptProgram.fromString(`graph() {}`);
    expect(result.success).toBe(true);
    const program = result.data as BlypescriptProgram;
    expect(program.statements.length).toBe(0);
  });

  // test("should repair primitives passed as edges", () => {
  //   const toolbox = generateToolbox(["glfx", "input"]);
  //   const blypescriptToolbox = BlypescriptToolbox.fromToolbox(toolbox);

  //   const result = BlypescriptProgram.fromString(
  //     `graph() {
	// 		const inputGLFXImage1 = glfx.GLFXImage();
	// 		const brightness = glfx.brightnessContrast(inputGLFXImage1['res'], 0.5, null, 0.5, 0);
	// 		const output = blix.output(brightness['res'], 'output');		
	// 	}`,
  //     blypescriptToolbox
  //   );
  //   // Readd this
  //   // expect(result.success).toBe(true);
  //   const program = result.data as BlypescriptProgram;
  //   expect(program.statements.length).toBe(4);
  // });
});

describe("Blypescript interpreter", () => {
  test("add nodes to empty graph", () => {
    const toolbox = generateToolbox(["glfx", "input", "blink"]);
    const blypescriptToolbox = BlypescriptToolbox.fromToolbox(toolbox);
    const graph = new CoreGraph();
    const coreGraphManager = new CoreGraphManager(toolbox);
    const blypescriptInterpreter = new BlypescriptInterpreter(toolbox, coreGraphManager);
    const exporter = new CoreGraphExporter(new BlypescriptExportStrategy(blypescriptToolbox));

    coreGraphManager.addGraph(graph);

    let response1 = graph.addNode(toolbox.getNodeInstance("input.number"), { x: 0, y: 0 });
    const uuid1 = response1.data!.nodeId;
    response1 = graph.addNode(toolbox.getNodeInstance("blix.output"), { x: 0, y: 0 });
    const uuid2 = response1.data!.nodeId;
    response1 = graph.addNode(toolbox.getNodeInstance("glfx.GLFXImage"), { x: 0, y: 0 });
    const uuid3 = response1.data!.nodeId;

    const node1 = graph.getNodes[uuid1];
    const node2 = graph.getNodes[uuid2];
    const node3 = graph.getNodes[uuid3];

    const anchorFrom = Object.keys(node3.getAnchors)[1];
    const anchorTo = Object.keys(node2.getAnchors)[0];
    let response2 = graph.addEdge(anchorFrom, anchorTo);

    const result2 = BlypescriptProgram.fromString(
      `graph() {
			const inputGLFXImage1 = glfx.GLFXImage();
			const output = blix.output(inputGLFXImage1['res'], 'output');		
		}`,
      blypescriptToolbox
    );

    expect(result2.success).toBe(true);
    const program1 = exporter.exportGraph(graph);
    const program2 = result2.data as BlypescriptProgram;

    blypescriptInterpreter.run(graph.uuid, program1, program2);
  });
});

describe("BlypescriptExporter", () => {
  let toolbox: ToolboxRegistry;
  let blypescriptToolbox: BlypescriptToolbox;
  let exporter: CoreGraphExporter<BlypescriptProgram>;
  let graph: CoreGraph;

  beforeEach(() => {
    toolbox = generateToolbox(["glfx", "input"]);
    blypescriptToolbox = BlypescriptToolbox.fromToolbox(toolbox);
    exporter = new CoreGraphExporter(new BlypescriptExportStrategy(blypescriptToolbox));

    graph = new CoreGraph();
    let response1 = graph.addNode(toolbox.getNodeInstance("input.number"), { x: 0, y: 0 });
    const uuid1 = response1.data!.nodeId;
    response1 = graph.addNode(toolbox.getNodeInstance("blix.output"), { x: 0, y: 0 });
    const uuid2 = response1.data!.nodeId;
    response1 = graph.addNode(toolbox.getNodeInstance("glfx.brightnessContrast"), { x: 0, y: 0 });
    const uuid3 = response1.data!.nodeId;

    const node1 = graph.getNodes[uuid1];
    const node2 = graph.getNodes[uuid2];

    const anchorFrom = Object.keys(node1.getAnchors)[0];
    const anchorTo = Object.keys(node2.getAnchors)[0];
    let response2 = graph.addEdge(anchorFrom, anchorTo);
  });

  test("should export a graph to blypescript", () => {
    const blypescriptProgram = exporter.exportGraph(graph);
    expect(blypescriptProgram).toBeDefined();
  });
});

// ===================================================================
// HELPERS
// ===================================================================

type PluginName = "input" | "glfx" | "blink" | "logic-plugin" | "math";

/**
 *
 * @param plugins
 * @returns
 */
function generateToolbox(pluginNames: PluginName[]): ToolboxRegistry {
  const toolboxRegistry = new ToolboxRegistry();
  toolboxRegistry.addInstance(createOutputNode());

  const pluginsPath = join(__dirname, "../../../../../blix-plugins");
  const ignorePatterns = [".DS_Store", "types.d.ts", "blink", "ripple"];
  const plugins = readdirSync(pluginsPath).filter((plugin) => {
    return !ignorePatterns.some((pattern) => plugin.includes(pattern));
  });

  for (const plugin of plugins) {
    const pluginPath = join(pluginsPath, plugin);
    const packageJson = join(pluginPath, "package.json");
    const data = readFileSync(packageJson);
    const packageData: PackageData = JSON.parse(data.toString());
    const mainPath = join(pluginPath, packageData.main.toString());
    const pluginInstance: Plugin = new Plugin(packageData, pluginPath);

    if (!pluginNames.includes(pluginInstance.name as PluginName)) {
      continue;
    }

    const pluginModule = require(pluginInstance.mainPath);

    if ("nodes" in pluginModule && typeof pluginModule.nodes === "object") {
      for (const node in pluginModule.nodes) {
        if (!pluginModule.nodes.hasOwnProperty(node)) continue;

        const ctx = new NodePluginContext(pluginInstance.name);

        try {
          pluginModule.nodes[node](ctx);
          toolboxRegistry.addInstance(ctx.nodeBuilder.build);
        } catch (err) {
          console.error("Error loading node from" + packageData.displayName);
        }
      }
    }
  }

  return toolboxRegistry;
}
