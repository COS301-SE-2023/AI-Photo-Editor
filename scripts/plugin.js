const { readFileSync, writeFileSync, existsSync } = require("fs");
const { exec } = require("child_process");
const { join, resolve } = require("path");

function buildGLFX() {
  const directory = resolve(join(__dirname, "..", "blix-plugins/glfx-plugin"));
  const options = { cwd: directory };
  const command = "npm ci && npm run build";

  console.log("Building glfx...");

  exec(command, options, (err, stdout) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log(stdout);
    console.log("Done building glfx.");
  });
}

function buildBlink() {
  const tsconfigPath = join(
    __dirname,
    "..",
    "blix-plugins/blink/node_modules/@tsconfig/svelte/tsconfig.json"
  );

  const directory = resolve(join(__dirname, "..", "blix-plugins/blink"));
  const options = { cwd: directory };
  let command = "npm ci";

  console.log("Building blink ...");

  exec(command, options, (err, stdout) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log(stdout);

    if (existsSync(tsconfigPath)) {
      const tsconfigRaw = readFileSync(tsconfigPath, "utf8");
      const withoutSingleLineComments = tsconfigRaw.replace(
        /^(?!.*https?:\/\/)(.*)\/\/(.*)$/gm,
        "$1"
      );
      const withoutComments = withoutSingleLineComments.replace(/\/\*([\s\S]*?)\*\//g, "");
      const tsconfigJSON = JSON.parse(withoutComments);
      tsconfigJSON.compilerOptions.moduleResolution = "node";
      delete tsconfigJSON.compilerOptions.verbatimModuleSyntax;
      writeFileSync(tsconfigPath, JSON.stringify(tsconfigJSON, null, 2));
    } else {
      console.log("TSConfig not found. Building...");
    }

    command = "npm run build";

    exec(command, options, (err, stdout) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(stdout);
      console.log("Done building blink.");
    });
  });
}

// buildGLFX();
buildBlink();
