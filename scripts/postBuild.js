const {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  existsSync,
  lstatSync,
  unlinkSync,
  rmdirSync,
  mkdirSync,
  copyFileSync,
} = require("fs");
const { join, basename } = require("path");

const Terser = require("terser");
const HTMLMinifier = require("html-minifier");
const CleanCSS = require("clean-css");

const minifyJSOptions = {
  mangle: {
    toplevel: true,
  },
  compress: {
    passes: 2,
  },
  output: {
    beautify: false,
    preamble: "/* uglified */",
  },
};

const getAllJSFiles = (dirPath, arrayOfFiles) => {
  const files = readdirSync(dirPath);

  if (arrayOfFiles == null) {
    arrayOfFiles = [];
  }

  files.forEach((file) => {
    // Ensure that API files are not minified
    if (statSync(join(dirPath, file)).isDirectory() && file !== "api") {
      arrayOfFiles = getAllJSFiles(join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(join(dirPath, file));
    }
  });

  return arrayOfFiles.filter((filePath) => /\.js$/.exec(filePath));
};

const minifyJSFiles = (filePaths) => {
  filePaths.forEach((filePath) => {
    const unminified = readFileSync(filePath, "utf8");
    Terser.minify(unminified, minifyJSOptions)
      .then((minified) => {
        writeFileSync(filePath, minified.code);
      })
      .catch((err) => {
        process.emitWarning(err);
        process.abort();
      });
  });
};

const deleteFolderRecursive = (folderPath) => {
  if (existsSync(folderPath)) {
    readdirSync(folderPath).forEach((file) => {
      const curPath = join(folderPath, file);
      if (lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        unlinkSync(curPath);
      }
    });
    rmdirSync(folderPath);
  }
};

const copyPublicFolderAndMinify = (folderPath, destinationPath) => {
  if (existsSync(destinationPath)) deleteFolderRecursive(destinationPath);

  mkdirSync(destinationPath);

  readdirSync(folderPath).forEach((file) => {
    const curPath = join(folderPath, file);
    const newPath = join(destinationPath, file);
    if (lstatSync(curPath).isDirectory()) {
      // recurse
      copyPublicFolderAndMinify(curPath, newPath);
    } else {
      if (/\.js$/.exec(curPath)) {
        // const unminified = readFileSync(curPath, "utf8");
        // Terser.minify(unminified, minifyJSOptions)
        //   .then((minified) => {
        //     writeFileSync(newPath, minified.code);
        //   })
        //   .catch((err) => {
        //     process.emitWarning(err);
        //     process.abort();
        //   });
        writeFileSync(newPath, readFileSync(curPath, "utf8"));
      } else if (/\.html$/.exec(curPath)) {
        const unminified = readFileSync(curPath, "utf8");

        const unminifiedCorrected = unminified.replace(
          '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src http://localhost:*; connect-src ws://localhost:*">',
          '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'">'
        );

        const minifierOptions = {
          preserveLineBreaks: false,
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
          minifyURLs: true,
          minifyJS: true,
          minifyCSS: true,
          removeComments: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          removeEmptyElements: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
          quoteCharacter: "'",
        };
        const minified = HTMLMinifier.minify(unminifiedCorrected, minifierOptions);
        writeFileSync(newPath, minified);
      } else if (/\.css$/.exec(curPath)) {
        const unminified = readFileSync(curPath, "utf8");
        const minified = new CleanCSS().minify(unminified);
        writeFileSync(newPath, minified.styles);
      } else if (/\.png$/.exec(curPath)) {
        const pngFile = readFileSync(curPath);
        writeFileSync(newPath, pngFile);
      }
    }
  });
};

const cleanTsconfig = () => {
  const tsconfigSvelteJSONPath = join(__dirname, "..", "tsconfig.svelte.prod.json");
  const tsconfigElectronJSONPath = join(__dirname, "..", "tsconfig.electron.prod.json");

  if (existsSync(tsconfigSvelteJSONPath)) unlinkSync(tsconfigSvelteJSONPath);
  if (existsSync(tsconfigElectronJSONPath)) unlinkSync(tsconfigElectronJSONPath);
};

const copyDirectory = (sourceDir, targetDir, extension = "") => {
  // Create the target directory if it doesn't exist
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir);
  }

  // Get the list of files and directories in the source directory
  const files = readdirSync(sourceDir);

  // Copy each file/directory to the target directory
  files.forEach((file) => {
    const sourcePath = join(sourceDir, file);
    const targetPath = join(targetDir, file);

    // Check if the current item is a directory
    if (lstatSync(sourcePath).isDirectory()) {
      // Recursively copy the subdirectory
      copyDirectory(sourcePath, targetPath);
    } else {
      // Copy the file
      if (sourcePath.endsWith(extension)) copyFileSync(sourcePath, targetPath);
    }
  });
};

const copyFile = (sourceFile, targetDir) => {
  const fileName = basename(sourceFile);
  const targetPath = join(targetDir, fileName);
  copyFileSync(sourceFile, targetPath);
};

const bundledElectronPath = join(__dirname, "..", "build");

const jsFiles = getAllJSFiles(bundledElectronPath);
minifyJSFiles(jsFiles);

copyPublicFolderAndMinify(join(__dirname, "..", "public"), join(bundledElectronPath, "public"));
copyDirectory(join(__dirname, "../public/images"), join(bundledElectronPath, "public/images"));
copyFile(join(__dirname, "../public/images/icon.png"), bundledElectronPath);
cleanTsconfig();
