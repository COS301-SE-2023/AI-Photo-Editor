/* eslint-disable no-console*/
import { Command } from "commander";
import { createInterface } from "readline";
import chalk from "chalk";
import { Profiler } from "./ai-profiler-v2";
import { CHAT_MODELS, ChatModel } from "./Model";
const prompts = require("prompts");

// ==================================================================
// SETUP
// ==================================================================

const profiler = new Profiler();
let program: Command;
let activeGraphId = "";
let activeChatId = "";
let activeModel: ChatModel = "GPT-3.5";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.setPrompt(chalk.magenta("> "));

readline.on("line", (input) => {
  program = new Command();
  // Need to reinitialize program to prevent state persistence bug
  initProgram();
  program.parse(["", "", ...input.trim().split(" ")]);
});

readline.on("close", () => {
  console.log("Exiting CLI...");
  process.exit(0);
});

// Prompt the user
readline.prompt();

// ==================================================================
// CLI
// ==================================================================

function initProgram() {
  program
    .command("init")
    .description("Creates a new graph sets it to active")
    .action(() => {
      activeGraphId = profiler.graphManager.createGraph();
      console.log(chalk.green("New graph created"));
      readline.prompt();
    });

  program
    .command("info")
    .description("Print current config")
    .action(() => {
      console.log(chalk.magenta("==========Config=========="));
      console.log(`Model: ${activeModel}`);
      console.log();
      readline.prompt();
    });

  program
    .command("config")
    .description("Print current config")
    .argument("[model]", "model to use", "GPT-3.5")
    .action((model) => {
      if (!(model in CHAT_MODELS)) {
        console.log(chalk.red("Model doesn't exist"));
        readline.prompt();
        return;
      }

      activeModel = model;
      readline.prompt();
    });

  program
    .command("reset")
    .description("Removes all graphs")
    .action(() => {
      profiler.graphManager.deleteGraphs(profiler.graphManager.getAllGraphUUIDs());
      console.log(chalk.green("All graphs removed"));
      readline.prompt();
    });

  program
    .command("prompt")
    .alias("p")
    .description("Runs prompt on current graph and last chat")
    .action(async () => {
      const line = program.args.join(" ");
      let prompt = line.slice(line.startsWith("p") ? 1 : 6).trim();

      if (prompt.startsWith('"') && prompt.endsWith('"')) {
        prompt = prompt.slice(1, -1);
      }

      if (!activeGraphId) {
        console.log(chalk.red("No graph selected"));
        readline.prompt();
        return;
      }

      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        readline.prompt();
        return;
      }

      const result = await profiler.aiManager.executePrompt({
        graphId: activeGraphId,
        model: activeModel,
        apiKey,
        prompt,
      });

      if (!result.success) {
        console.log(chalk.red(`${result.message} [${result.error}]`));
        if (
          result.data &&
          typeof result.data === "object" &&
          "chatId" in result.data &&
          typeof result.data.chatId === "string"
        ) {
          activeChatId = result.data.chatId;
        }
        readline.prompt();
        return;
      }

      activeChatId = result.data.chatId;
      console.log(chalk.green(`Prompt executed in xms`));
      readline.prompt();
    });

  program
    .command("ls")
    .description("List available graphs, chats or models")
    .argument("[type]", "type of entity [graph, g | chat, c | model, m]")
    .option("-s, --select", "select specific entity")
    .option("-a, --all", "display all entities")
    .action(async (type, options) => {
      if (type === "graph" || type === "g") {
        if (options.all) {
          if (profiler.graphManager.getAllGraphUUIDs().length === 0) {
            console.log(chalk.yellow("No graph available"));
            return;
          }

          for (const id of profiler.graphManager.getAllGraphUUIDs()) {
            console.log(chalk.blue(`----${id.slice(0, 4)}----`));
            const blypescriptProgram = profiler.getBlypescriptProgram(activeGraphId);
            console.log(blypescriptProgram?.toString() || chalk.yellow("No graph available"));
            console.log();
          }
        } else if (options.select) {
          //   const response = await prompts({
          //     type: "select",
          //     name: "value",
          //     message: "Pick a graph to display",
          //     choices: profiler.graphManager
          //       .getAllGraphUUIDs()
          //       .map((id) => ({ title: id.slice(0, 4), value: id })),
          //     initial: 0,
          //   });
        } else {
          const blypescriptProgram = profiler.getBlypescriptProgram(activeGraphId);
          console.log(
            blypescriptProgram
              ? chalk.blue(blypescriptProgram.toString())
              : chalk.yellow("No graph available")
          );
        }
      } else if (type === "chat" || type === "c") {
        const chat = profiler.aiManager.getChat(activeChatId);

        if (!chat) {
          console.log(chalk.yellow("No active chat"));
          return;
        }

        for (const msg of chat.getMessages()) {
          const map = {
            assistant: chalk.magenta.bold("==========Assistant=========="),
            system: chalk.cyan.bold("==========System=========="),
            user: chalk.blue.bold("==========User=========="),
            blix: chalk.blue.bold("==========Blix=========="),
          } as const;

          console.log(map[msg.role]);
          console.log(`${msg.content}\n`);
        }
      } else if (type === "model" || type === "m") {
        console.log(chalk.magenta.bold("==========Models=========="));
        console.log(Object.keys(CHAT_MODELS).join("\n"));
      } else {
        console.log(chalk.yellow("Invalid type. Expected `graph` or `chat`."));
      }

      readline.prompt();
    });

  program
    .command("quit")
    .alias("q")
    .description("Quit the CLI")
    .action(() => {
      console.log("Exiting CLI...");
      process.exit(0);
    });

  program
    .command("clear")
    .alias("c")
    .description("Clears the terminal")
    .action(() => {
      process.stdout.write("\x1Bc");
      readline.prompt();
    });

  program
    .command("help")
    .alias("h")
    .description("Shows CLI options")
    .action(() => {
      program.outputHelp();
      readline.prompt();
    });

  program.action((cmd) => {
    console.log(`Unknown command`);
    console.log(`Type 'help' to see the list of available commands.`);
    readline.prompt();
  });
}
