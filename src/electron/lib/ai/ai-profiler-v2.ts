import { CoreGraphImporter } from "../../lib/core-graph/CoreGraphImporter";
import { NodeInstance, ToolboxRegistry } from "../../lib/registries/ToolboxRegistry";
import { ProjectFile } from "../../lib/projects/CoreProject";
import { CoreGraph } from "../../lib/core-graph/CoreGraph";
import { join } from "path";
import { readFileSync, readdirSync } from "fs";
import { NodeBuilder } from "../../lib/plugins/builders/NodeBuilder";
import { PackageData } from "../../lib/plugins/PluginManager";
import { NodePluginContext, Plugin } from "../../lib/plugins/Plugin";
import {
  BlypescriptExportStrategy,
  CoreGraphExporter,
} from "../../lib/core-graph/CoreGraphExporter";
import { BlypescriptProgram, colorString } from "./AiLang";
import { AiManager, Message } from "./AiManagerv2";
import { CoreGraphManager } from "../../lib/core-graph/CoreGraphManager";
import readline from "readline";

class Profiler {
  private toolboxRegistry!: ToolboxRegistry;
  private graphManager: CoreGraphManager;
  private aiManager: AiManager;
  private coreGraphImporter: CoreGraphImporter;

  constructor() {
    this.toolboxRegistry = Profiler.generateToolboxRegistry();
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
    const blypescriptExporter = new BlypescriptExportStrategy(this.toolboxRegistry);
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

  private static generateToolboxRegistry(): ToolboxRegistry {
    const toolboxRegistry = new ToolboxRegistry();
    toolboxRegistry.addInstance(this.generateBlixOutputNode());

    const pluginsPath = join(__dirname, "../../../../blix-plugins");
    const ignorePatterns = [".DS_Store"];
    const plugins = readdirSync(pluginsPath).filter((plugin) => {
      return !ignorePatterns.some((pattern) => plugin.includes(pattern));
    });

    for (const plugin of plugins) {
      const pluginPath = join(pluginsPath, plugin);
      const packageJson = join(pluginPath, "package.json");
      const data = readFileSync(packageJson);
      const packageData: PackageData = JSON.parse(data.toString());
      const mainPath = join(pluginPath, packageData.main.toString());
      const pluginInstance: Plugin = new Plugin(packageData, pluginPath, mainPath);

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
    // outputUIBuilder.addButton(
    //   {
    //     componentId: "export",
    //     label: "Export",
    //     defaultValue: "blix.graphs.export",
    //     updatesBackend: false,
    //   },
    //   {}
    // );
    outputUIBuilder.addTextInput(
      {
        componentId: "outputId",
        label: "Export",
        defaultValue: "default",
        updatesBackend: true,
      },
      {}
    );

    outputNodeBuilder.setTitle("Output");
    outputNodeBuilder.setDescription(
      "Dedicated output node which accepts data of any type, and returns the result to the system"
    );
    outputNodeBuilder.define(
      (
        result: { [key: string]: any },
        inputUI: { [key: string]: any },
        requiredOutputs: string[]
      ) => {
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
