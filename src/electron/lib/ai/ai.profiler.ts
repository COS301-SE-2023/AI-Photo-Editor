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
import { object } from "zod";

// ==================================================================
// Config
// ==================================================================

const PLUGINS = ["sharp-plugin"];
const PLUGIN_DIRECTORY = join(__dirname, "../../../../blix-plugins");
const PYTHON_SCRIPT_PATH = join(__dirname, "../../../../src/electron/lib/ai/python/main.py");
const SYSTEM_PROMPT = `System: When asked for help or to perform a task you will act as an AI assistant
for node-based AI photo editing application. Your main role is to help the user
manipulate a node based graph. If a question is asked that does not involve the
graph or image editing then remind the user of your main role. Don't make
assumptions about what values to plug into functions. Ask for clarification if a
user request is ambiguous. Outputs of nodes can only be connected to inputs of
other nodes. Do not try to connect inputs to inputs or outputs to outputs.

System: Your very final response should be a one sentence summary without any
JSON.`;

function main() {
  const prompt = "Add a brightness and hue node. Then connect the hue to the brightness node";
  execute(prompt, true);
}

main();

// ==================================================================
//	Main methods
// ==================================================================

function execute(userPrompt: string, verbose = false) {
  const pythonProcess = spawn("python3", [PYTHON_SCRIPT_PATH]);
  const toolbox = createToolbox(PLUGINS);
  const llmToolbox = convertToolbox(toolbox);
  const coreGraph = createGraph();
  const llmGraph = convertGraph(coreGraph);

  const context = {
    prompt: userPrompt,
    toolbox: llmToolbox,
    graph: llmGraph.graph,
  };

  const data = JSON.stringify(context);
  pythonProcess.stdin.write(`${data.trim()}\nend of transmission\n`);

  pythonProcess.stdout.on("data", (buffer: Buffer) => {
    const data = buffer.toString();
    const command = JSON.parse(data) as LLMFunctions;
    // console.log(data.toString());
    if (!command.function) return;
    const res = runCommandOnGraph(coreGraph, command);
    // console.log(JSON.stringify(res));

    if (res.status === "success") {
      pythonProcess.stdin.write(
        `${JSON.stringify({
          status: "success",
          newGraph: convertGraph(coreGraph).graph,
        })}\n ${SYSTEM_PROMPT}\nend of transmission\n`
      );
    } else {
      pythonProcess.stdin.write(`${JSON.stringify(res)}\nend of transmission\n`);
    }
    // console.log(JSON.stringify(convertGraph(coreGraph).graph, null, 2));
  });

  pythonProcess.stderr.on("data", (buffer: Buffer) => {
    const result = buffer.toString();
    // console.log(result);
  });
}

// ==================================================================
// Helper methods
// ==================================================================

function createToolbox(plugins: string[]) {
  const toolbox: Record<string, NodeInstance> = {};

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

function runCommandOnGraph(graph: CoreGraph, command: LLMFunctions) {
  const llmGraph = convertGraph(graph);

  if (command.function === "addNode") {
    const toolbox = createToolbox(PLUGINS);
    return graph.addNode(toolbox[command.args.signature]);
  } else if (command.function === "addEdge") {
    const { anchorMap } = llmGraph;
    return graph.addEdge(anchorMap[command.args.output], anchorMap[command.args.input]);
  }

  return { status: "success" };
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

type LLMFunctions =
  | {
      function: "addNode";
      args: {
        signature: "string";
      };
    }
  | {
      function: "removeNode";
      args: {
        id: "string";
      };
    }
  | {
      function: "addEdge";
      args: {
        input: "string";
        output: "string";
      };
    }
  | {
      function: "removeEdge";
      args: {
        input: "string";
        output: "string";
      };
    };
