import expect from "expect";
// import { ProjectManager } from "../../../src/electron/lib/projects/ProjectManager";
import { Plugin,PluginContext } from "../../../../../../src/electron/lib/plugins/Plugin";
import { Blix } from "../../../../../../src/electron/lib/Blix";
import { MainWindow } from "../../../../../../src/electron/lib/api/apis/WindowApi";
import logger from "../../../../../../src/electron/utils/logger"

const mainWindow: MainWindow = {
  apis: {
    commandRegistryApi: jest.fn(),
    clientGraphApi: jest.fn(),
    clientProjectApi: jest.fn()
    
  }
} as any;

jest.mock("../../../../../../src/electron/lib/projects/ProjectManager");

jest.mock("electron", () => ({
  app: {
    getPath: jest.fn((path) => {
      return "test/electron";
    }),
    getName: jest.fn(() => {
      return "TestElectron";
    }),
    getVersion: jest.fn(() => {
      return "v1.1.1";
    })
  },
}));

jest.mock("chokidar", () => ({
  default: {
    watch: jest.fn(() => {
      return {
        on: jest.fn()
      }
    }),
  }
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
  readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));


describe("Test plugin integrations", () => {
    let plugin : Plugin;
    let blix : Blix;

    const pack : any = {
        name: 'hello-plugin',
        displayName: 'Hello Plugin',
        description: 'A plugin that says hello',
        version: '0.0.1',
        author: 'Rec1dite',
        repository: '',
        contributes: { commands: [ [Object] ], nodes: [ [Object] ] },
        main: 'src/main.js',
        renderer: 'src/renderer.js',
        devDependencies: { '@types/node': '^12.0.0', typescript: '^3.4.5' },
        comments: [ 'This property will be completely ignored' ]
      };


    const plugDir : string = "../../../../blix-plugins/hello-plugin";
    const main : string = "../../../../blix-plugins/hello-plugin/src/main.js";


    const Bpack : any = {
      name: 'hello-plugin',
      displayName: 'Hello Plugin',
      description: 'A plugin that says hello',
      version: '0.0.1',
      author: 'Rec1dite',
      repository: '',
      contributes: { commands: [ [Object] ], nodes: [ [Object] ] },
      main: 'src/main.js',
      renderer: 'src/renderer.js',
      devDependencies: { '@types/node': '^12.0.0', typescript: '^3.4.5' },
      comments: [ 'This property will be completely ignored' ]
    };

    const badPlug :any = {
      pack : Bpack,
      plugDir  : "../../../../__mocks__/hello-plugin",
      main   :"../../../../__mocks__/hello-plugin/src/main.js"
    }


    beforeEach(() => {
      jest.clearAllMocks();
      plugin = new Plugin(pack,plugDir,main);
      blix = new Blix();
      plugin.requireSelf(blix);
    });

    //Dummy replace with actual tests
    test("Plugin should be defined", () => {
      expect(plugin).toBeDefined();
    });



});
