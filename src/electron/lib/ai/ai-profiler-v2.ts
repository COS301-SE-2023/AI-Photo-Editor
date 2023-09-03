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
import { AiManager } from "./AiManagerv2";
import { CoreGraphManager } from "../../lib/core-graph/CoreGraphManager";
import readline from "readline";
import { NodeUI, NodeUILeaf } from "../../../shared/ui/NodeUITypes";
import { Message } from "./Chat";
import dotenv from "dotenv";
dotenv.config();

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

      const response = await this.aiManager.executePrompt({
        prompt,
        graphId: coreGraph.uuid,
        messages,
        model: "GPT-3.5",
        apiKey: process.env.OPENAI_API_KEY || "",
        // apiKey: process.env.PALM_API_KEY || "",
      });

      if (response.success) {
        messages = response.data.messages;
        messages[messages.length - 1].content = coreGraphExporter.exportGraph(coreGraph).toString();
        // console.log(response.usage);
      } else {
        console.log(colorString(response.message, "RED"));
        console.log(colorString(response.error, "RED"));
      }
    }
  }

  public test() {
    const blypescriptToolbox = BlypescriptToolbox.fromToolbox(this.toolboxRegistry);
    if (blypescriptToolbox.success) {
      const str = blypescriptToolbox.data.toString();
      return str;
    }

    return blypescriptToolbox.message;
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
