const { readFileSync, writeFileSync, existsSync } = require("fs");
const { execSync } = require("child_process");
const { join, resolve } = require("path");

function buildGLFX() {
  const directory = resolve(join(__dirname, "..", "blix-plugins/glfx-plugin"));
  const options = { cwd: directory };
  const command = "npm ci && npm run build";

  console.log("Building glfx...");

  try {
    const output = execSync(command, options);
    console.log(output.toString());
  } catch (error) {
    console.log(error.toString());
  }

  console.log("Building glfx completed");
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

  console.log("Installing blink node_modules...");

  try {
    const output = execSync(command, options);
    console.log(output.toString());
  } catch (error) {
    console.log(error.toString());
  }

  console.log("Attempting to fix tsconfig...");
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
    console.log("TSConfig fixed");
  } else {
    console.log("TSConfig not found. Building...");
  }

  command = "npm run build";

  console.log("Building blink...");

  try {
    const output = execSync(command, options);
    console.log(output.toString());
  } catch (error) {
    console.log(error.toString());
  }

  console.log("Building blink completed");
}

buildGLFX();
buildBlink();
