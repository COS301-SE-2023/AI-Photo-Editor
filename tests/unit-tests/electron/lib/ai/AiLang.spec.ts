import { BlypescriptProgram, BlypescriptToolbox } from "../../../../../src/electron/lib/ai/AiLang";
import { ToolboxRegistry } from "../../../../../src/electron/lib/registries/ToolboxRegistry";
import { createOutputNode } from "../../../../../src/electron/lib/Blix";
import { join } from "path";
import { readFileSync, readdirSync } from "fs";
import { PackageData } from "../../../../../src/electron/lib/plugins/PluginManager";
import { Plugin, NodePluginContext } from "../../../../../src/electron/lib/plugins/Plugin";

describe("Blypescript parser", () => {
  test("should parse an empty graph", () => {
    const result = BlypescriptProgram.fromString(`graph() {}`);
    expect(result.success).toBe(true);
    const program = result.data as BlypescriptProgram;
    expect(program.statements.length).toBe(0);
  });

  test("should repair primitives passed as edges", () => {
    const toolbox = generateToolbox(["glfx", "input"]);
    const blypescriptToolbox = BlypescriptToolbox.fromToolbox(toolbox);

    const result = BlypescriptProgram.fromString(
      `graph() {
			const inputGLFXImage1 = glfx.GLFXImage();
			const brightness = glfx.brightnessContrast(inputGLFXImage1['res'], 0.5, null, 0.5, 0);
			const output = blix.output(brightness['res'], 'output');		
		}`,
      blypescriptToolbox
    );

    expect(result.success).toBe(true);
    const program = result.data as BlypescriptProgram;
    expect(program.statements.length).toBe(4);
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
  const ignorePatterns = [".DS_Store", "types.d.ts"];
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
