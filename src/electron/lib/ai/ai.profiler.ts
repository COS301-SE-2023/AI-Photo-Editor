import { CoreGraph } from "../../lib/core-graph/CoreGraph";
import { NodePluginContext } from "../../lib/plugins/Plugin";
import { type NodeInstance } from "../../lib/registries/ToolboxRegistry";
import { spawn } from "child_process";
import {
  CoreGraphExporter,
  LLMExportStrategy,
  LLMGraph,
} from "../../lib/core-graph/CoreGraphExporter";
import { join } from "path";
import logger from "../../utils/logger";
import { ChildProcessWithoutNullStreams } from "child_process";
import { readdirSync } from "fs";
import {
  ResponseFunctions,
  addEdge,
  addNode,
  cookUnsafeResponse,
  removeEdge,
  removeNode,
} from "./ai-cookbook";
import { CoreGraphManager } from "../../lib/core-graph/CoreGraphManager";

// ==================================================================
// Config
// ==================================================================

const PLUGIN_DIRECTORY = join(__dirname, "../../../../blix-plugins");
// const PLUGINS = readdirSync(PLUGIN_DIRECTORY);
const PYTHON_SCRIPT_PATH = join(__dirname, "../../../../src/electron/lib/ai/python/main.py");

class Profiler {
  toolbox: Record<string, NodeInstance>;
  coreGraph: CoreGraph;
  llmToolbox: LLMToolbox;
  pythonProcess: ChildProcessWithoutNullStreams;
  llmGraph: LLMGraph;

  constructor() {
    this.toolbox = createToolbox();
    this.coreGraph = createGraph();
    this.llmToolbox = convertToolbox(this.toolbox);
    this.pythonProcess = spawn("python3", [PYTHON_SCRIPT_PATH]);
    this.llmGraph = convertGraph(this.coreGraph);
  }

  main() {
    const prompt = "Add a brightness and hue node. Then connect the hue to the brightness node";
    this.execute(prompt, false);
  }

  // ==================================================================
  //	Main methods
  // ==================================================================

  execute(userPrompt: string, verbose = false) {
    let finalResponse = "";

    const context = {
      prompt: userPrompt,
      // toolbox : llmToolbox,
      plugin: pluginContext(this.toolbox), // basically the plugins from toolbox
      nodes: this.llmGraph.graph.nodes,
      edges: this.llmGraph.graph.edges,
    };

    const data = JSON.stringify(context);
    this.pythonProcess.stdin.write(`${data}\nend of transmission\n`);
    // console.log(":)")

    // Handle responses
    this.pythonProcess.stdout.on("data", (buffer: Buffer) => {
      const data = buffer.toString();
      // console.log("Received from Python: ", data);
      // console.log(this.coreGraph)

      try {
        const res = cookUnsafeResponse(JSON.parse(data));

        if (res.type === "exit") {
          logger.info("Response from python : ", res.message);
          finalResponse = res.message;
        } else if (res.type === "error") {
          throw res.message;
        } else if (res.type === "debug") {
          // Do something with debugging info
        } else if (res.type === "function") {
          const operationRes = this.executeMagicWand(res, this.coreGraph.uuid);
          const operationResStr = JSON.stringify(operationRes);

          logger.info("Blix response: ", operationResStr);

          this.pythonProcess.stdin.write(`${operationResStr}\n`);
          this.pythonProcess.stdin.write("end of transmission\n");
        }
      } catch (error) {
        // Something went horribly wrong
        this.pythonProcess?.kill();
        finalResponse = "Oops. Something went horribly wrong🫡The LLM is clearly a bot";
        // console.log("Python script error: ", JSON.stringify(error));
      }
    });

    // Handle errors
    this.pythonProcess.stderr.on("data", (data: Buffer) => {
      const result = data.toString();
      // console.log("Error executing Python script: ", result);
    });

    // Handle process exit
    this.pythonProcess.on("close", (data: Buffer) => {
      const code = data.toString();
      if (code == null) logger.warn(`Python script exited with code null`);
      else logger.warn(`Python script exited with code ${code}`);
    });
  }

  executeMagicWand(config: ResponseFunctions, graphId: string) {
    const { name, args } = config;
    const graphManager = new CoreGraphManager();
    graphManager.addGraph(this.coreGraph);

    if (name === "addNode") {
      return addNode(graphManager, this.toolbox, graphId, args);
    } else if (name === "removeNode") {
      return removeNode(graphManager, graphId, args);
    } else if (name === "addEdge") {
      return addEdge(graphManager, graphId, args);
    } else if (name === "removeEdge") {
      return removeEdge(graphManager, graphId, args);
    }

    // It should never reach here
    return {
      status: "error",
      message: "Something went wrong in magic wand",
    };
  }
}

// ==================================================================
// Helper methods
// ==================================================================

function createToolbox() {
  const toolbox: Record<string, NodeInstance> = {};

  const plugins = readdirSync(PLUGIN_DIRECTORY);

  for (const plugin of plugins) {
    const pluginPath = join(PLUGIN_DIRECTORY, plugin);
    const pluginModule = require(pluginPath);
    const pluginNodes = pluginModule.nodes;

    if (!("nodes" in pluginModule && typeof pluginModule.nodes === "object")) {
      continue;
    }

    for (const node in pluginNodes) {
      if (!(node in pluginNodes)) {
        continue;
      }

      const ctx = new NodePluginContext();
      pluginNodes[node](ctx);
      const nodeInstance = ctx.nodeBuilder.build;
      toolbox[nodeInstance.signature] = nodeInstance;
    }
  }

  // console.log(toolbox)
  return toolbox;
}

function convertToolbox(toolbox: Record<string, NodeInstance>) {
  const convertedToolbox: LLMToolbox = {};

  for (const signature in toolbox) {
    if (signature in toolbox) {
      const node = toolbox[signature];

      convertedToolbox[signature] = {
        signature: node.signature,
        description: node.description,
        inputs: node.inputs.map((input) => input.type),
        outputs: node.outputs.map((output) => output.type),
      };
    }
  }
  return convertedToolbox;
}

function convertGraph(coreGraph: CoreGraph) {
  const llmExportStrategy = new LLMExportStrategy();
  const exporter = new CoreGraphExporter(llmExportStrategy);
  return exporter.exportGraph(coreGraph);
}

function createGraph() {
  const coreGraph = new CoreGraph();
  return coreGraph;
}

function pluginContext(toolbox: Record<string, NodeInstance>) {
  const pluginNodes: string[] = [];

  for (const index in toolbox) {
    if (index in toolbox && toolbox.hasOwnProperty(index)) {
      const node: NodeInstance = toolbox[index];
      pluginNodes.push(node.signature + ": " + node.description);
    }
  }

  return pluginNodes;
}

// ==================================================================
// Types
// ==================================================================

type LLMToolbox = Record<
  string,
  {
    signature: string;
    description: string;
    inputs: string[];
    outputs: string[];
  }
>;

// ======================================================================
// Execution
// ======================================================================

const profiler = new Profiler();
profiler.main();

// ======================================================================
// Old Code
// ======================================================================

// this.pythonProcess.stdout.on("data", (buffer: Buffer) => {
//   const data = buffer.toString();
//   const command = JSON.parse(data) as LLMFunctions;
//   logger.info("Received from Python: ", command);

//   console.log(data.toString());
//   if (!command.function) return;
//   const res = runCommandOnGraph(this.coreGraph, command);
//   // console.log(JSON.stringify(res));

//   if (res.status === "success") {
//     this.pythonProcess.stdin.write(
//       `${JSON.stringify({
//         status: "success",
//         newGraph: convertGraph(this.coreGraph).graph,
//       })}\n ${"REPLACE"}\nend of transmission\n`
//     );
//   } else {
//     this.pythonProcess.stdin.write(`${JSON.stringify(res)}\nend of transmission\n`);
//   }
//   // console.log(JSON.stringify(convertGraph(coreGraph).graph, null, 2));
// });

// function runCommandOnGraph(graph: CoreGraph, command: LLMFunctions) {
//   const llmGraph = convertGraph(graph);

//   if (command.function === "addNode") {
//     const toolbox = createToolbox();
//     return graph.addNode(toolbox[command.args.signature]);
//   } else if (command.function === "addEdge") {
//     const { anchorMap } = llmGraph;
//     return graph.addEdge(anchorMap[command.args.output], anchorMap[command.args.input]);
//   }

//   return { status: "success" };
// }

// type LLMFunctions =
//   | {
//       function: "addNode";
//       args: {
//         signature: "string";
//       };
//     }
//   | {
//       function: "removeNode";
//       args: {
//         id: "string";
//       };
//     }
//   | {
//       function: "addEdge";
//       args: {
//         input: "string";
//         output: "string";
//       };
//     }
//   | {
//       function: "removeEdge";
//       args: {
//         input: "string";
//         output: "string";
//       };
//     };
