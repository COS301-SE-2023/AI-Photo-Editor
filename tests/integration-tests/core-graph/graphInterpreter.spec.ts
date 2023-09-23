import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, MinAnchor } from "../../../src/electron/lib/registries/ToolboxRegistry";
import { MainWindow } from "../../../src/electron/lib/api/apis/WindowApi";
import { Blix } from "../../../src/electron/lib/Blix";
import { CoreGraph } from "../../../src/electron/lib/core-graph/CoreGraph";
import exp from "constants";

jest.mock('@electron/remote', () => ({ exec: jest.fn() }));
const mainWindow: MainWindow = {
  apis: {
    commandRegistryApi: jest.fn(),
    clientGraphApi: jest.fn(),
    clientProjectApi: jest.fn(),
    toolboxClientApi: {
      registryChanged: jest.fn(),
    },
    commandClientApi: {
      registryChanged: jest.fn(),
    }
    
  }
} as any;

jest.mock("electron-store", () => ({
    default: jest.fn().mockImplementation(() => {
      return {}
    })
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

jest.mock("../../../src/electron/lib/projects/ProjectManager");
jest.mock('../../../src/electron/lib/plugins/PluginManager')


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
    }),
    getAppPath: jest.fn(() => {
      return "test/electron";
    })
  },
  ipcMain: {
    on: jest.fn()
  }
}));

jest.mock('ws', () => {
  return {
    WebSocketServer:  jest.fn().mockImplementation(() => {
      return {
        on: jest.fn()
      }
    }
    )
  }
});


jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
  readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
  readdirSync: jest.fn(() => ["hello-plugin"]),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe("Test graph interpreter", () => {
    let blix: Blix

    beforeEach(() => {
        blix = new Blix();
        blix.init(mainWindow);
    });

    test("Test output of interpreter", () => {
      const tempNodesInt: NodeInstance[] = [];


      tempNodesInt.push(
        new NodeInstance(
          `hello-plugin.hello`,
          `input`,
          `folder`,
          `hello-plugin`,
          `title`,
          `description`,
          [],
          [
            {
              type: "number",
              identifier: "out1",
              displayName: "output_anchor1",
            },
          ],
          (input: {[key: string]: any}, uiInputs: {[key: string]: any}, requiredOutputs: string[]) => {
            return { out1: 2 };
          }
        )
      );

      tempNodesInt.push(
        new NodeInstance(
          `hello-plugin.hello`,
          `flip`,
          `folder`,
          `hello-plugin`,
          `title`,
          `description`,
          [
            {
              type: "number",
              identifier: "in1",
              displayName: "input_anchor1",
            },
          ],
          [
            {
              type: "number",
              identifier: "out1",
              displayName: "output_anchor1",
            },
          ],
          (input: {[key: string]: any}, uiInputs: {[key: string]: any}, requiredOutputs: string[]) => {
            return { out1: input["in1"] };
          }
        )
      );

      tempNodesInt.push(
        new NodeInstance(
          `output`,
          `blix`,
          `folder`,
          `hello-plugin`,
          `title`,
          `description`,
          [
            {
              type: "number",
              identifier: "in1",
              displayName: "input_anchor1",
            },
          ],
          [],
          (input: {[key: string]: any}, uiInputs: {[key: string]: any}, requiredOutputs: string[]) => {
            expect(input["mediaOutput"]["content"]).toEqual(2);
            expect(input["mediaOutput"]["dataType"]).toEqual('number');
            return {};
          }
        )
      );

      blix.toolbox.addInstance(tempNodesInt[0]);
      blix.toolbox.addInstance(tempNodesInt[1]);
      blix.toolbox.addInstance(tempNodesInt[2]);

      const g2: CoreGraph = new CoreGraph();
      
      const pos = { x: 0, y: 0 };
      g2.addNode(tempNodesInt[0], pos);
      g2.addNode(tempNodesInt[1], pos);
      g2.addNode(tempNodesInt[2], pos);


      const g2Nodes = g2.getNodes;
      const g2Node1 = Object.values(g2Nodes)[0];
      const g2Node2 = Object.values(g2Nodes)[1];
      const g2Node3 = Object.values(g2Nodes)[2];

      g2.addEdge(
        Object.values(g2Node1.getAnchors)[0].uuid,
        Object.values(g2Node2.getAnchors)[0].uuid
      );

      g2.addEdge(
        Object.values(g2Node2.getAnchors)[1].uuid,
        Object.values(g2Node3.getAnchors)[0].uuid
      );

      // console.log = jest.fn();
      blix.graphInterpreter.run(g2, g2Node3.uuid);
      // expect(console.log).toHaveBeenCalledWith(2);


    });

    test("Test output of interpreter", () => {
      const tempNodesInt: NodeInstance[] = [];


      tempNodesInt.push(
        new NodeInstance(
          `hello-plugin.hello`,
          `input`,
          `folder`,
          `hello-plugin`,
          `title`,
          `description`,
          [],
          [
            {
              type: "number",
              identifier: "out1",
              displayName: "output_anchor1",
            },
          ],
          (input: {[key: string]: any}, uiInputs: {[key: string]: any}, requiredOutputs: string[]) => {
            return { out1: 2 };
          }
        )
      );

      tempNodesInt.push(
        new NodeInstance(
          `hello-plugin.hello`,
          `flip`,
          `folder`,
          `hello-plugin`,
          `title`,
          `description`,
          [
            {
              type: "number",
              identifier: "in1",
              displayName: "input_anchor1",
            },
          ],
          [
            {
              type: "number",
              identifier: "out1",
              displayName: "output_anchor1",
            },
          ],
          (input: {[key: string]: any}, uiInputs: {[key: string]: any}, requiredOutputs: string[]) => {
            return { out1: input["nothing"].doesNotExist };
          }
        )
      );

      tempNodesInt.push(
        new NodeInstance(
          `output`,
          `blix`,
          `folder`,
          `hello-plugin`,
          `title`,
          `description`,
          [
            {
              type: "number",
              identifier: "in1",
              displayName: "input_anchor1",
            },
          ],
          [],
          (input: {[key: string]: any}, uiInputs: {[key: string]: any}, requiredOutputs: string[]) => {
            expect(input["mediaOutput"]["content"]).toEqual("Cannot read properties of undefined (reading 'doesNotExist')");
            expect(input["mediaOutput"]["dataType"]).toEqual("Error");
            return {};
          }
        )
      );

      blix.toolbox.addInstance(tempNodesInt[0]);
      blix.toolbox.addInstance(tempNodesInt[1]);
      blix.toolbox.addInstance(tempNodesInt[2]);

      const g2: CoreGraph = new CoreGraph();
      
      const pos = { x: 0, y: 0 }
      g2.addNode(tempNodesInt[0], pos);
      g2.addNode(tempNodesInt[1], pos);
      g2.addNode(tempNodesInt[2], pos);


      const g2Nodes = g2.getNodes;
      const g2Node1 = Object.values(g2Nodes)[0];
      const g2Node2 = Object.values(g2Nodes)[1];
      const g2Node3 = Object.values(g2Nodes)[2];

      g2.addEdge(
        Object.values(g2Node1.getAnchors)[0].uuid,
        Object.values(g2Node2.getAnchors)[0].uuid
      );

      g2.addEdge(
        Object.values(g2Node2.getAnchors)[1].uuid,
        Object.values(g2Node3.getAnchors)[0].uuid
      );

      blix.graphInterpreter.run(g2, g2Node3.uuid);


    });

});
