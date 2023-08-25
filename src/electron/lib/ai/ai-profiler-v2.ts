import { CoreGraphImporter } from "../../lib/core-graph/CoreGraphImporter";
import { NodeInstance, ToolboxRegistry } from "../../lib/registries/ToolboxRegistry";
import { ProjectFile } from "../../lib/projects/CoreProject";
import { CoreGraph, Node } from "../../lib/core-graph/CoreGraph";
import { join } from "path";
import { readFileSync, readdirSync } from "fs";
import { NodeBuilder } from "../../lib/plugins/builders/NodeBuilder";
import { PackageData } from "../../lib/plugins/PluginManager";
import { NodePluginContext, Plugin } from "../../lib/plugins/Plugin";
import {
  BlypescriptExportStrategy,
  BlypescriptExportStrategyV2,
  CoreGraphExporter,
} from "../../lib/core-graph/CoreGraphExporter";
import { BlypescriptProgram, BlypescriptToolbox, colorString } from "./AiLang";
import { AiManager, Message } from "./AiManagerv2";
import { CoreGraphManager } from "../../lib/core-graph/CoreGraphManager";
import readline from "readline";
import { NodeUI, NodeUILeaf } from "../../../shared/ui/NodeUITypes";
import { BaseError } from "./errors";

class Profiler {
  private toolboxRegistry!: ToolboxRegistry;
  private graphManager: CoreGraphManager;
  private aiManager: AiManager;
  private coreGraphImporter: CoreGraphImporter;

  constructor(toolboxFilter: string[] = []) {
    this.toolboxRegistry = Profiler.generateToolboxRegistry(toolboxFilter);
    this.coreGraphImporter = new CoreGraphImporter(this.toolboxRegistry);
    this.graphManager = new CoreGraphManager(this.toolboxRegistry);
    this.aiManager = new AiManager(this.toolboxRegistry, this.graphManager);
  }

  public async run() {
    const userHomeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE || "";
    const projectPath = join(userHomeDir, "Downloads/subtract.blix");
    const projectData = readFileSync(projectPath, "utf8");
    const projectJSON = JSON.parse(projectData) as ProjectFile;
    const graphJSON = projectJSON.graphs[0];
    // let coreGraph = this.coreGraphImporter.import("json", graphJSON);
    let coreGraph = new CoreGraph();
    const blypescriptToolbox = BlypescriptToolbox.fromToolbox(this.toolboxRegistry);
    if (!blypescriptToolbox.success) {
      return;
    }
    // const blypescriptExporter = new BlypescriptExportStrategy(this.toolboxRegistry);
    const blypescriptExporter = new BlypescriptExportStrategyV2(blypescriptToolbox.data);
    const coreGraphExporter = new CoreGraphExporter(blypescriptExporter);
    const blypescriptProgram = coreGraphExporter.exportGraph(coreGraph);

    this.graphManager.addGraph(coreGraph);
    let prompt = "";
    let messages: Message[] | undefined;

    while ((prompt = await this.getPrompt()) !== "quit") {
      if (prompt === "reset") {
        console.log(colorString("Message history cleared", "BLUE"));
        messages = undefined;
        coreGraph = this.coreGraphImporter.import("json", graphJSON);
        this.graphManager.addGraph(coreGraph);
        continue;
      }

      if (prompt === "history") {
        console.log(messages);
        continue;
      }

      if (prompt === "clear") {
        console.log("\x1Bc");
        continue;
      }

      if (prompt === "history") {
        console.log(messages);
        continue;
      }

      if (prompt === "graph") {
        console.log(colorString("//==========Current Graph==========//", "ORANGE"));
        console.log(coreGraphExporter.exportGraph(coreGraph).toString());
        continue;
      }

      const response = await this.aiManager.sendPrompt(prompt, coreGraph.uuid, messages);

      if (response) {
        messages = response.messages;
        messages[messages.length - 1].content = coreGraphExporter.exportGraph(coreGraph).toString();
        console.log(response.usage);
      }
    }
  }

  public test() {
    const blypescriptToolbox = BlypescriptToolbox.fromToolbox(this.toolboxRegistry);
    if (blypescriptToolbox.success) {
      const str = blypescriptToolbox.data.toString();
      return str;
    }

    return blypescriptToolbox.error.message;
  }

  test2() {
    console.log(JSON.stringify(Object.keys(this.toolboxRegistry.getRegistry()), null, 2));
    for (const nodeInstance of Object.values(this.toolboxRegistry.getRegistry())) {
      const graph = new CoreGraph();
      const result = graph.addNode(nodeInstance, { x: 0, y: 0 });
      if (result.status === "success") {
        const node = graph.getNodes[result.data.nodeId];
        console.log(JSON.stringify(graph.getAllUIInputs[node.uuid], null, 2));
        console.log(this.getUiInputs(nodeInstance.ui))
      } else {
        console.log(result.message);
      }
    }
    // const nodeInstance = this.toolboxRegistry.getNodeInstance("input-plugin.inputImage");
  }

  getUiInputs(ui: NodeUI | null): string[] {
    if (!ui) {
      return [];
    }

    if (ui.type === "parent") {
      return ui.params.flatMap((child) => this.getUiInputs(child));
    } else if (ui.type === "leaf") {
      const props = ui.params[0];
      const componentType = (ui as NodeUILeaf).category;

      if (!props) {
        throw new BaseError("Props not available on NodeUiLeaf");
      }

      if (componentType === "Button") {
      } else if (componentType === "Slider") {
      } else if (componentType === "Knob") {
      } else if (componentType === "Dropdown") {
      } else if (componentType === "TextInput") {
      } else if (componentType === "ColorPicker") {
      } else if (componentType === "FilePicker") {
      } else {
        throw new BaseError(`${componentType} UI component has not been implemented yet`);
      }

      return [ui.label];
    }

    return [];
  }

  private getPrompt() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise<string>((resolve) => {
      rl.question(colorString("\n> Enter prompt: ", "LIGHT_BLUE"), (input) => {
        rl.close();
        resolve(input.toString());
      });
    });
  }

  private static generateToolboxRegistry(filter: string[] = []): ToolboxRegistry {
    const toolboxRegistry = new ToolboxRegistry();
    toolboxRegistry.addInstance(this.generateBlixOutputNode());

    const pluginsPath = join(__dirname, "../../../../blix-plugins");
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

      if (filter.length && !filter.some((el) => el === pluginInstance.name)) {
        continue;
      }

      const pluginModule = require(pluginInstance.mainPath);

      if ("nodes" in pluginModule && typeof pluginModule.nodes === "object") {
        for (const node in pluginModule.nodes) {
          if (!pluginModule.nodes.hasOwnProperty(node)) continue;

          const ctx = new NodePluginContext();

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

  private static generateBlixOutputNode(): NodeInstance {
    const outputNodeBuilder = new NodeBuilder("blix", "output");
    const outputUIBuilder = outputNodeBuilder.createUIBuilder();
    outputUIBuilder.addButton(
      {
        componentId: "export",
        label: "Export",
        defaultValue: "blix.graphs.export",
        triggerUpdate: false,
      },
      {}
    );
    outputUIBuilder.addTextInput(
      {
        componentId: "outputId",
        label: "Export",
        defaultValue: "default",
        triggerUpdate: true,
      },
      {}
    );

    outputNodeBuilder.setTitle("Output");
    outputNodeBuilder.setDescription(
      "Dedicated output node which accepts data of any type, and returns the result to the system"
    );
    // tempNodeBuilder.define(({ input, from }: { input: MediaOutput; from: string }) => {
    outputNodeBuilder.define(
      (
        result: { [key: string]: any },
        inputUI: { [key: string]: any },
        requiredOutputs: string[]
      ) => {
        // mainWindow.apis.mediaClientApi.outputChanged(mediaOutput as MediaOutput);
        // const mediaOutput: MediaOutput = result.mediaOutput;
        // mediaOutput.outputId = inputUI.outputId;
        // this._mediaManager.updateMedia(mediaOutput);
        return {};
      }
    );

    outputNodeBuilder.addInput("", "in", "In");
    outputNodeBuilder.setUI(outputUIBuilder);
    return outputNodeBuilder.build;
  }

}

const profiler = new Profiler();
profiler.run();
// console.log(profiler.test());

// const profiler2 = new Profiler(["Input-plugin", "Math-plugin"]);
// const profiler2 = new Profiler(["Math-plugin"]);
// profiler2.test();
// console.log(profiler2.test());
